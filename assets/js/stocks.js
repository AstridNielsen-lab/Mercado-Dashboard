// Stocks Management System
class StocksManager {
    constructor() {
        this.isInitialized = false;
        this.stocksData = [];
        this.portfolio = {};
        this.updateInterval = null;
        this.watchlist = [];
        this.init();
    }

    init() {
        this.loadPortfolio();
        this.loadWatchlist();
        this.bindEvents();
        this.startDataUpdates();
        this.isInitialized = true;
        console.log('Stocks Manager initialized successfully');
    }

    loadPortfolio() {
        this.portfolio = CONFIG_UTILS.loadFromStorage('stocks_portfolio', {
            'PETR4.SA': { shares: 0, averagePrice: 0 },
            'VALE3.SA': { shares: 0, averagePrice: 0 },
            'ITUB4.SA': { shares: 0, averagePrice: 0 },
            'BBDC4.SA': { shares: 0, averagePrice: 0 },
            'ABEV3.SA': { shares: 0, averagePrice: 0 },
            'WEGE3.SA': { shares: 0, averagePrice: 0 }
        });
    }

    loadWatchlist() {
        this.watchlist = CONFIG_UTILS.loadFromStorage('stocks_watchlist', [
            ...APP_CONFIG.STOCKS.BRAZILIAN_STOCKS,
            ...APP_CONFIG.STOCKS.US_STOCKS
        ]);
    }

    bindEvents() {
        // Buy/Sell buttons in stocks table
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-stock-buy')) {
                const symbol = e.target.getAttribute('data-symbol');
                this.showBuyModal(symbol);
            }
            
            if (e.target.classList.contains('btn-stock-sell')) {
                const symbol = e.target.getAttribute('data-symbol');
                this.showSellModal(symbol);
            }
            
            if (e.target.classList.contains('btn-add-watchlist')) {
                this.showAddToWatchlistModal();
            }
        });
    }

    async startDataUpdates() {
        // Initial load
        await this.updateStocksData();
        this.updateStocksTable();

        // Set up interval updates
        this.updateInterval = setInterval(() => {
            this.updateStocksData();
        }, APP_CONFIG.UI.REFRESH_INTERVALS.STOCKS);
    }

    async updateStocksData() {
        try {
            PERFORMANCE_MONITOR.start('stocks_data_update');
            
            const data = await stocksAPI.getMultipleStocks(this.watchlist);
            
            if (data && data.length > 0) {
                this.stocksData = data;
                this.updateStocksTable();
                this.updatePortfolioValues();
                this.updateDashboardStats();
            }
            
            PERFORMANCE_MONITOR.end('stocks_data_update');
        } catch (error) {
            ERROR_HANDLER.log(error, 'StocksManager.updateStocksData');
        }
    }

    updateStocksTable() {
        const tbody = document.getElementById('stocks-tbody');
        if (!tbody || !this.stocksData.length) return;

        tbody.innerHTML = '';

        this.stocksData.forEach(stock => {
            const row = this.createStockRow(stock);
            tbody.appendChild(row);
        });
    }

    createStockRow(stock) {
        const row = document.createElement('tr');
        row.className = 'stock-row';
        row.setAttribute('data-symbol', stock.symbol);

        const changeClass = stock.changePercent >= 0 ? 'positive' : 'negative';
        const changeIcon = stock.changePercent >= 0 ? '▲' : '▼';
        
        // Check if user owns this stock
        const owned = this.portfolio[stock.symbol];
        const ownedShares = owned ? owned.shares : 0;

        row.innerHTML = `
            <td>
                <div class="stock-info">
                    <strong>${stock.symbol}</strong>
                    ${ownedShares > 0 ? `<span class="owned-badge">${ownedShares} cotas</span>` : ''}
                </div>
            </td>
            <td class="price">${CONFIG_UTILS.formatCurrency(stock.price)}</td>
            <td class="change ${changeClass}">
                ${changeIcon} ${CONFIG_UTILS.formatCurrency(Math.abs(stock.change))}
            </td>
            <td class="change-percent ${changeClass}">
                ${CONFIG_UTILS.formatPercentage(stock.changePercent)}
            </td>
            <td class="volume">${this.formatVolume(stock.volume)}</td>
            <td class="actions">
                <button class="btn-buy btn-stock-buy" data-symbol="${stock.symbol}">Comprar</button>
                <button class="btn-sell btn-stock-sell" data-symbol="${stock.symbol}" 
                    ${ownedShares <= 0 ? 'disabled' : ''}>Vender</button>
            </td>
        `;

        return row;
    }

    formatVolume(volume) {
        if (volume >= 1000000000) {
            return (volume / 1000000000).toFixed(1) + 'B';
        } else if (volume >= 1000000) {
            return (volume / 1000000).toFixed(1) + 'M';
        } else if (volume >= 1000) {
            return (volume / 1000).toFixed(1) + 'K';
        }
        return volume.toString();
    }

    updatePortfolioValues() {
        for (const [symbol, holding] of Object.entries(this.portfolio)) {
            if (holding.shares > 0) {
                const currentStock = this.stocksData.find(s => s.symbol === symbol);
                if (currentStock) {
                    holding.currentPrice = currentStock.price;
                    holding.currentValue = holding.shares * currentStock.price;
                    holding.totalReturn = holding.currentValue - (holding.shares * holding.averagePrice);
                    holding.returnPercent = holding.averagePrice > 0 ? 
                        ((holding.currentPrice - holding.averagePrice) / holding.averagePrice) * 100 : 0;
                }
            }
        }
    }

    updateDashboardStats() {
        const totalStocksValue = Object.values(this.portfolio)
            .reduce((total, holding) => total + (holding.currentValue || 0), 0);
        
        const stocksValueElement = document.getElementById('stocks-value');
        if (stocksValueElement) {
            stocksValueElement.textContent = CONFIG_UTILS.formatCurrency(totalStocksValue);
        }

        // Update total assets
        this.updateTotalAssets(totalStocksValue);
    }

    updateTotalAssets(stocksValue) {
        const cryptoValue = parseFloat(
            document.getElementById('crypto-value')?.textContent?.replace(/[^\d.-]/g, '') || '0'
        );
        
        const totalAssets = stocksValue + cryptoValue;
        
        const totalAssetsElement = document.getElementById('total-assets');
        if (totalAssetsElement) {
            totalAssetsElement.textContent = CONFIG_UTILS.formatCurrency(totalAssets);
        }
    }

    showBuyModal(symbol) {
        const stock = this.stocksData.find(s => s.symbol === symbol);
        if (!stock) return;

        const modal = this.createTransactionModal('buy', symbol, stock);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    showSellModal(symbol) {
        const stock = this.stocksData.find(s => s.symbol === symbol);
        const holding = this.portfolio[symbol];
        
        if (!stock || !holding || holding.shares <= 0) {
            ERROR_HANDLER.notify('Você não possui ações desta empresa.', 'error');
            return;
        }

        const modal = this.createTransactionModal('sell', symbol, stock, holding);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createTransactionModal(type, symbol, stock, holding = null) {
        const modal = document.createElement('div');
        modal.className = 'modal stocks-modal';
        
        const maxShares = type === 'sell' && holding ? holding.shares : null;
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${type === 'buy' ? 'Comprar' : 'Vender'} ${symbol}</h2>
                <div class="stock-modal-info">
                    <div class="stock-price">
                        <span>Preço Atual:</span>
                        <strong>${CONFIG_UTILS.formatCurrency(stock.price)}</strong>
                    </div>
                    <div class="stock-change ${stock.changePercent >= 0 ? 'positive' : 'negative'}">
                        <span>Variação:</span>
                        <strong>${CONFIG_UTILS.formatPercentage(stock.changePercent)}</strong>
                    </div>
                    ${holding && type === 'sell' ? `
                        <div class="holding-info">
                            <span>Ações Possuídas:</span>
                            <strong>${holding.shares}</strong>
                        </div>
                        <div class="holding-info">
                            <span>Preço Médio:</span>
                            <strong>${CONFIG_UTILS.formatCurrency(holding.averagePrice)}</strong>
                        </div>
                    ` : ''}
                </div>
                <div class="transaction-form">
                    <div class="form-group">
                        <label>Quantidade de Ações</label>
                        <input type="number" id="${type}-shares" min="1" 
                            ${maxShares ? `max="${maxShares}"` : ''} 
                            placeholder="Número de ações">
                    </div>
                    <div class="form-group">
                        <label>Valor Total Estimado</label>
                        <input type="text" id="${type}-total" readonly>
                    </div>
                    <div class="form-actions">
                        <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button class="btn-${type === 'buy' ? 'primary' : 'danger'}" 
                            onclick="stocksManager.executeStockTrade('${type}', '${symbol}')">
                            ${type === 'buy' ? 'Comprar' : 'Vender'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Bind events
        const sharesInput = modal.querySelector(`#${type}-shares`);
        const totalInput = modal.querySelector(`#${type}-total`);
        
        sharesInput.addEventListener('input', () => {
            const shares = parseInt(sharesInput.value) || 0;
            const total = shares * stock.price;
            totalInput.value = CONFIG_UTILS.formatCurrency(total);
        });

        // Close modal events
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });

        return modal;
    }

    async executeStockTrade(type, symbol) {
        try {
            const modal = document.querySelector('.stocks-modal');
            const shares = parseInt(modal.querySelector(`#${type}-shares`).value);
            
            if (!shares || shares <= 0) {
                ERROR_HANDLER.notify('Por favor, insira uma quantidade válida de ações.', 'error');
                return;
            }

            const stock = this.stocksData.find(s => s.symbol === symbol);
            if (!stock) {
                ERROR_HANDLER.notify('Ação não encontrada.', 'error');
                return;
            }

            const currentHolding = this.portfolio[symbol] || { shares: 0, averagePrice: 0 };

            if (type === 'buy') {
                // Calculate new average price
                const totalCost = (currentHolding.shares * currentHolding.averagePrice) + (shares * stock.price);
                const totalShares = currentHolding.shares + shares;
                
                this.portfolio[symbol] = {
                    ...currentHolding,
                    shares: totalShares,
                    averagePrice: totalCost / totalShares
                };
                
                ERROR_HANDLER.notify(`Compra realizada: ${shares} ações de ${symbol}`, 'success');
                
            } else { // sell
                if (currentHolding.shares < shares) {
                    ERROR_HANDLER.notify('Quantidade insuficiente de ações.', 'error');
                    return;
                }
                
                this.portfolio[symbol] = {
                    ...currentHolding,
                    shares: currentHolding.shares - shares
                };
                
                ERROR_HANDLER.notify(`Venda realizada: ${shares} ações de ${symbol}`, 'success');
            }

            // Save portfolio
            CONFIG_UTILS.saveToStorage('stocks_portfolio', this.portfolio);
            
            // Log transaction
            this.logStockTransaction(type, symbol, shares, stock.price);
            
            // Update displays
            this.updatePortfolioValues();
            this.updateStocksTable();
            this.updateDashboardStats();
            
            // Close modal
            modal.remove();
            
        } catch (error) {
            ERROR_HANDLER.log(error, 'StocksManager.executeStockTrade');
            ERROR_HANDLER.notify('Erro ao executar operação.', 'error');
        }
    }

    logStockTransaction(type, symbol, shares, price) {
        const transaction = {
            id: CONFIG_UTILS.generateId(),
            type,
            symbol,
            shares,
            price,
            total: shares * price,
            timestamp: Date.now(),
            status: 'completed'
        };

        const transactions = CONFIG_UTILS.loadFromStorage('stock_transactions', []);
        transactions.push(transaction);
        
        // Keep only last 100 transactions
        if (transactions.length > 100) {
            transactions.splice(0, transactions.length - 100);
        }
        
        CONFIG_UTILS.saveToStorage('stock_transactions', transactions);
    }

    showAddToWatchlistModal() {
        const modal = document.createElement('div');
        modal.className = 'modal watchlist-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Adicionar à Lista de Acompanhamento</h2>
                <div class="form-group">
                    <label>Código da Ação</label>
                    <input type="text" id="watchlist-symbol" placeholder="Ex: PETR4.SA, AAPL" 
                        style="text-transform: uppercase;">
                    <small>Para ações brasileiras, adicione .SA ao final (ex: PETR4.SA)</small>
                </div>
                <div class="form-actions">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="stocksManager.addToWatchlist()">Adicionar</button>
                </div>
            </div>
        `;

        // Convert input to uppercase
        const symbolInput = modal.querySelector('#watchlist-symbol');
        symbolInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });

        // Enter key to add
        symbolInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addToWatchlist();
            }
        });

        // Close events
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });

        document.body.appendChild(modal);
        modal.style.display = 'block';
        symbolInput.focus();
    }

    async addToWatchlist() {
        const modal = document.querySelector('.watchlist-modal');
        const symbol = modal.querySelector('#watchlist-symbol').value.trim().toUpperCase();
        
        if (!symbol) {
            ERROR_HANDLER.notify('Por favor, insira um código válido.', 'error');
            return;
        }

        if (this.watchlist.includes(symbol)) {
            ERROR_HANDLER.notify('Esta ação já está na sua lista.', 'error');
            return;
        }

        try {
            // Test if symbol exists by fetching its data
            const stockData = await stocksAPI.getStockPrice(symbol);
            
            if (stockData) {
                this.watchlist.push(symbol);
                CONFIG_UTILS.saveToStorage('stocks_watchlist', this.watchlist);
                
                // Add to portfolio with 0 shares
                if (!this.portfolio[symbol]) {
                    this.portfolio[symbol] = { shares: 0, averagePrice: 0 };
                    CONFIG_UTILS.saveToStorage('stocks_portfolio', this.portfolio);
                }
                
                ERROR_HANDLER.notify(`${symbol} adicionado à lista de acompanhamento.`, 'success');
                
                // Refresh data to include new symbol
                await this.updateStocksData();
                
                modal.remove();
            } else {
                ERROR_HANDLER.notify('Código de ação não encontrado.', 'error');
            }
        } catch (error) {
            ERROR_HANDLER.log(error, `Failed to add ${symbol} to watchlist`);
            ERROR_HANDLER.notify('Erro ao adicionar ação. Verifique o código.', 'error');
        }
    }

    removeFromWatchlist(symbol) {
        const index = this.watchlist.indexOf(symbol);
        if (index > -1) {
            this.watchlist.splice(index, 1);
            CONFIG_UTILS.saveToStorage('stocks_watchlist', this.watchlist);
            
            // Remove from stocks data
            this.stocksData = this.stocksData.filter(s => s.symbol !== symbol);
            this.updateStocksTable();
            
            ERROR_HANDLER.notify(`${symbol} removido da lista.`, 'success');
        }
    }

    getPortfolioSummary() {
        const summary = {
            totalValue: 0,
            totalInvested: 0,
            totalReturn: 0,
            holdings: []
        };

        for (const [symbol, holding] of Object.entries(this.portfolio)) {
            if (holding.shares > 0) {
                const invested = holding.shares * holding.averagePrice;
                const currentValue = holding.currentValue || 0;
                const returns = currentValue - invested;
                
                summary.totalValue += currentValue;
                summary.totalInvested += invested;
                summary.totalReturn += returns;
                
                summary.holdings.push({
                    symbol,
                    shares: holding.shares,
                    averagePrice: holding.averagePrice,
                    currentPrice: holding.currentPrice || 0,
                    currentValue: currentValue,
                    invested: invested,
                    returns: returns,
                    returnPercent: holding.returnPercent || 0
                });
            }
        }

        summary.returnPercent = summary.totalInvested > 0 ? 
            (summary.totalReturn / summary.totalInvested) * 100 : 0;

        return summary;
    }

    exportTransactionHistory() {
        const transactions = CONFIG_UTILS.loadFromStorage('stock_transactions', []);
        const csv = this.convertTransactionsToCSV(transactions);
        this.downloadCSV(csv, 'stock_transactions.csv');
    }

    convertTransactionsToCSV(transactions) {
        const headers = ['Data', 'Tipo', 'Ação', 'Quantidade', 'Preço', 'Total', 'Status'];
        const rows = transactions.map(tx => [
            CONFIG_UTILS.formatDate(new Date(tx.timestamp)),
            tx.type === 'buy' ? 'Compra' : 'Venda',
            tx.symbol,
            tx.shares.toString(),
            CONFIG_UTILS.formatCurrency(tx.price),
            CONFIG_UTILS.formatCurrency(tx.total),
            tx.status === 'completed' ? 'Concluída' : 'Pendente'
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Market analysis functions
    getTopGainers() {
        return this.stocksData
            .filter(stock => stock.changePercent > 0)
            .sort((a, b) => b.changePercent - a.changePercent)
            .slice(0, 5);
    }

    getTopLosers() {
        return this.stocksData
            .filter(stock => stock.changePercent < 0)
            .sort((a, b) => a.changePercent - b.changePercent)
            .slice(0, 5);
    }

    getHighestVolume() {
        return this.stocksData
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 5);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.isInitialized = false;
    }
}

// Initialize Stocks Manager
let stocksManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        stocksManager = new StocksManager();
    });
} else {
    stocksManager = new StocksManager();
}

// Export for global access
if (typeof window !== 'undefined') {
    window.StocksManager = StocksManager;
    window.stocksManager = stocksManager;
}

