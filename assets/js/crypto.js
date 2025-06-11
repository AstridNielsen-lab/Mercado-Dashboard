// Cryptocurrency Management System
class CryptoManager {
    constructor() {
        this.isInitialized = false;
        this.cryptoData = {};
        this.wallets = {};
        this.updateInterval = null;
        this.chartInstances = {};
        this.init();
    }

    init() {
        this.loadWalletConfiguration();
        this.bindEvents();
        this.startDataUpdates();
        this.isInitialized = true;
        console.log('Crypto Manager initialized successfully');
    }

    loadWalletConfiguration() {
        this.wallets = {
            bitcoin: {
                ...APP_CONFIG.WALLETS.BITCOIN,
                balance: CONFIG_UTILS.loadFromStorage('crypto_balance_btc', 0),
                value: 0
            },
            ethereum: {
                ...APP_CONFIG.WALLETS.ETHEREUM,
                balance: CONFIG_UTILS.loadFromStorage('crypto_balance_eth', 0),
                value: 0
            },
            litecoin: {
                ...APP_CONFIG.WALLETS.LITECOIN,
                balance: CONFIG_UTILS.loadFromStorage('crypto_balance_ltc', 0),
                value: 0
            }
        };
    }

    bindEvents() {
        // Timeframe selector
        const timeframeSelect = document.getElementById('crypto-timeframe');
        if (timeframeSelect) {
            timeframeSelect.addEventListener('change', (e) => {
                this.updateCharts(e.target.value);
            });
        }

        // Buy/Sell buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-buy')) {
                const walletCard = e.target.closest('.wallet-card');
                if (walletCard) {
                    const symbol = this.getCryptoSymbolFromCard(walletCard);
                    this.showBuyModal(symbol);
                }
            }
            
            if (e.target.classList.contains('btn-sell')) {
                const walletCard = e.target.closest('.wallet-card');
                if (walletCard) {
                    const symbol = this.getCryptoSymbolFromCard(walletCard);
                    this.showSellModal(symbol);
                }
            }
        });
    }

    getCryptoSymbolFromCard(card) {
        const symbolElement = card.querySelector('.wallet-symbol');
        return symbolElement ? symbolElement.textContent.toLowerCase() : 'btc';
    }

    async startDataUpdates() {
        // Initial load
        await this.updateCryptoData();
        this.updateWalletDisplay();
        this.initializeCharts();

        // Set up interval updates
        this.updateInterval = setInterval(() => {
            this.updateCryptoData();
        }, APP_CONFIG.UI.REFRESH_INTERVALS.CRYPTO);
    }

    async updateCryptoData() {
        try {
            PERFORMANCE_MONITOR.start('crypto_data_update');
            
            const data = await cryptoAPI.getCryptoPrices();
            
            if (data) {
                this.cryptoData = data;
                this.updateWalletValues();
                this.updateWalletDisplay();
                this.updateDashboardStats();
            }
            
            PERFORMANCE_MONITOR.end('crypto_data_update');
        } catch (error) {
            ERROR_HANDLER.log(error, 'CryptoManager.updateCryptoData');
        }
    }

    updateWalletValues() {
        for (const [coin, wallet] of Object.entries(this.wallets)) {
            if (this.cryptoData[coin]) {
                wallet.value = wallet.balance * this.cryptoData[coin].brl;
                wallet.price = this.cryptoData[coin].brl;
                wallet.change24h = this.cryptoData[coin].brl_24h_change;
            }
        }
    }

    updateWalletDisplay() {
        for (const [coin, wallet] of Object.entries(this.wallets)) {
            this.updateWalletCard(coin, wallet);
        }
    }

    updateWalletCard(coin, wallet) {
        const card = document.querySelector(`[data-crypto="${coin}"]`) || 
                    this.findWalletCardBySymbol(wallet.symbol);
        
        if (!card) return;

        // Update balance
        const balanceElement = card.querySelector('.wallet-balance');
        if (balanceElement) {
            balanceElement.textContent = `${wallet.balance.toFixed(6)} ${wallet.symbol}`;
        }

        // Update value in BRL
        const valueElement = card.querySelector('.wallet-value');
        if (valueElement) {
            valueElement.textContent = CONFIG_UTILS.formatCurrency(wallet.value || 0);
        }

        // Update price change
        const changeElement = card.querySelector('.price-change');
        if (changeElement && wallet.change24h !== undefined) {
            const change = wallet.change24h;
            changeElement.textContent = CONFIG_UTILS.formatPercentage(change);
            changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
        }

        // Update current price display (if exists)
        const priceElement = card.querySelector('.current-price');
        if (priceElement && wallet.price) {
            priceElement.textContent = CONFIG_UTILS.formatCurrency(wallet.price);
        }
    }

    findWalletCardBySymbol(symbol) {
        const symbolElements = document.querySelectorAll('.wallet-symbol');
        for (const element of symbolElements) {
            if (element.textContent === symbol) {
                return element.closest('.wallet-card');
            }
        }
        return null;
    }

    updateDashboardStats() {
        // Update total crypto value in dashboard
        const totalCryptoValue = Object.values(this.wallets)
            .reduce((total, wallet) => total + (wallet.value || 0), 0);
        
        const cryptoValueElement = document.getElementById('crypto-value');
        if (cryptoValueElement) {
            cryptoValueElement.textContent = CONFIG_UTILS.formatCurrency(totalCryptoValue);
        }

        // Update total assets
        this.updateTotalAssets(totalCryptoValue);
    }

    updateTotalAssets(cryptoValue) {
        // Get stocks value (this would be updated by stocks manager)
        const stocksValue = parseFloat(
            document.getElementById('stocks-value')?.textContent?.replace(/[^\d.-]/g, '') || '0'
        );
        
        const totalAssets = cryptoValue + stocksValue;
        
        const totalAssetsElement = document.getElementById('total-assets');
        if (totalAssetsElement) {
            totalAssetsElement.textContent = CONFIG_UTILS.formatCurrency(totalAssets);
        }
    }

    async initializeCharts() {
        await this.updateCharts('24h');
    }

    async updateCharts(timeframe = '24h') {
        try {
            const chartContainer = document.getElementById('crypto-chart');
            if (!chartContainer) return;

            // Destroy existing chart
            if (this.chartInstances.cryptoChart) {
                this.chartInstances.cryptoChart.destroy();
            }

            // Get chart data for multiple cryptocurrencies
            const chartData = await this.prepareChartData(timeframe);
            
            // Create new chart
            this.chartInstances.cryptoChart = new Chart(chartContainer, {
                type: 'line',
                data: chartData,
                options: this.getChartOptions()
            });
        } catch (error) {
            ERROR_HANDLER.log(error, 'CryptoManager.updateCharts');
        }
    }

    async prepareChartData(timeframe) {
        const days = APP_CONFIG.CRYPTO.TIMEFRAMES[timeframe] || '1';
        const colors = {
            bitcoin: '#f7931e',
            ethereum: '#627eea',
            litecoin: '#345d9d'
        };

        const datasets = [];
        
        for (const coin of Object.keys(this.wallets)) {
            try {
                const chartData = await cryptoAPI.getCryptoChart(coin, days);
                
                if (chartData && chartData.prices) {
                    datasets.push({
                        label: this.wallets[coin].name,
                        data: chartData.prices.map(point => ({
                            x: new Date(point[0]),
                            y: point[1]
                        })),
                        borderColor: colors[coin] || '#666',
                        backgroundColor: `${colors[coin] || '#666'}20`,
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    });
                }
            } catch (error) {
                ERROR_HANDLER.log(error, `Failed to load chart data for ${coin}`);
            }
        }

        return {
            datasets
        };
    }

    getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#666',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${CONFIG_UTILS.formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        displayFormats: {
                            hour: 'HH:mm',
                            day: 'MMM dd',
                            week: 'MMM dd'
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        color: '#666',
                        callback: function(value) {
                            return CONFIG_UTILS.formatCurrency(value);
                        }
                    }
                }
            }
        };
    }

    showBuyModal(crypto) {
        const modal = this.createTransactionModal('buy', crypto);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    showSellModal(crypto) {
        const modal = this.createTransactionModal('sell', crypto);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createTransactionModal(type, crypto) {
        const modal = document.createElement('div');
        modal.className = 'modal crypto-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${type === 'buy' ? 'Comprar' : 'Vender'} ${crypto.toUpperCase()}</h2>
                <div class="transaction-form">
                    <div class="form-group">
                        <label>Quantidade (${crypto.toUpperCase()})</label>
                        <input type="number" id="${type}-amount" step="0.00000001" min="0" placeholder="0.00000000">
                    </div>
                    <div class="form-group">
                        <label>Valor Estimado</label>
                        <input type="text" id="${type}-value" readonly>
                    </div>
                    <div class="form-group">
                        <label>Preço Atual</label>
                        <span class="current-price">${this.getCurrentPrice(crypto)}</span>
                    </div>
                    <div class="form-actions">
                        <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button class="btn-${type === 'buy' ? 'primary' : 'danger'}" onclick="cryptoManager.executeTrade('${type}', '${crypto}')">
                            ${type === 'buy' ? 'Comprar' : 'Vender'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Bind events
        const amountInput = modal.querySelector(`#${type}-amount`);
        const valueInput = modal.querySelector(`#${type}-value`);
        
        amountInput.addEventListener('input', () => {
            const amount = parseFloat(amountInput.value) || 0;
            const price = this.getCurrentPriceValue(crypto);
            const total = amount * price;
            valueInput.value = CONFIG_UTILS.formatCurrency(total);
        });

        // Close modal on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close button
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });

        return modal;
    }

    getCurrentPrice(crypto) {
        const wallet = this.wallets[crypto.toLowerCase()];
        if (wallet && wallet.price) {
            return CONFIG_UTILS.formatCurrency(wallet.price);
        }
        return 'N/A';
    }

    getCurrentPriceValue(crypto) {
        const wallet = this.wallets[crypto.toLowerCase()];
        return wallet && wallet.price ? wallet.price : 0;
    }

    async executeTrade(type, crypto) {
        try {
            const modal = document.querySelector('.crypto-modal');
            const amount = parseFloat(modal.querySelector(`#${type}-amount`).value);
            
            if (!amount || amount <= 0) {
                ERROR_HANDLER.notify('Por favor, insira uma quantidade válida.', 'error');
                return;
            }

            const wallet = this.wallets[crypto.toLowerCase()];
            if (!wallet) {
                ERROR_HANDLER.notify('Carteira não encontrada.', 'error');
                return;
            }

            // Simulate transaction (in production, integrate with real exchange API)
            if (type === 'buy') {
                wallet.balance += amount;
                ERROR_HANDLER.notify(`Compra realizada: ${amount} ${crypto.toUpperCase()}`, 'success');
            } else {
                if (wallet.balance < amount) {
                    ERROR_HANDLER.notify('Saldo insuficiente.', 'error');
                    return;
                }
                wallet.balance -= amount;
                ERROR_HANDLER.notify(`Venda realizada: ${amount} ${crypto.toUpperCase()}`, 'success');
            }

            // Save new balance
            CONFIG_UTILS.saveToStorage(`crypto_balance_${crypto.toLowerCase()}`, wallet.balance);
            
            // Update display
            this.updateWalletValues();
            this.updateWalletDisplay();
            this.updateDashboardStats();
            
            // Log transaction
            this.logTransaction(type, crypto, amount, wallet.price);
            
            // Close modal
            modal.remove();
            
        } catch (error) {
            ERROR_HANDLER.log(error, 'CryptoManager.executeTrade');
            ERROR_HANDLER.notify('Erro ao executar operação.', 'error');
        }
    }

    logTransaction(type, crypto, amount, price) {
        const transaction = {
            id: CONFIG_UTILS.generateId(),
            type,
            crypto: crypto.toLowerCase(),
            amount,
            price,
            total: amount * price,
            timestamp: Date.now(),
            status: 'completed'
        };

        const transactions = CONFIG_UTILS.loadFromStorage('crypto_transactions', []);
        transactions.push(transaction);
        
        // Keep only last 100 transactions
        if (transactions.length > 100) {
            transactions.splice(0, transactions.length - 100);
        }
        
        CONFIG_UTILS.saveToStorage('crypto_transactions', transactions);
    }

    getPortfolioSummary() {
        const summary = {
            totalValue: 0,
            totalChange24h: 0,
            currencies: {}
        };

        for (const [coin, wallet] of Object.entries(this.wallets)) {
            if (wallet.balance > 0) {
                const value = wallet.value || 0;
                const change24h = (wallet.change24h || 0) * wallet.balance * (wallet.price || 0) / 100;
                
                summary.totalValue += value;
                summary.totalChange24h += change24h;
                
                summary.currencies[coin] = {
                    symbol: wallet.symbol,
                    balance: wallet.balance,
                    value: value,
                    percentage: 0 // Will be calculated after total
                };
            }
        }

        // Calculate percentages
        for (const currency of Object.values(summary.currencies)) {
            currency.percentage = summary.totalValue > 0 ? 
                (currency.value / summary.totalValue) * 100 : 0;
        }

        return summary;
    }

    exportTransactionHistory() {
        const transactions = CONFIG_UTILS.loadFromStorage('crypto_transactions', []);
        const csv = this.convertTransactionsToCSV(transactions);
        this.downloadCSV(csv, 'crypto_transactions.csv');
    }

    convertTransactionsToCSV(transactions) {
        const headers = ['Data', 'Tipo', 'Moeda', 'Quantidade', 'Preço', 'Total', 'Status'];
        const rows = transactions.map(tx => [
            CONFIG_UTILS.formatDate(new Date(tx.timestamp)),
            tx.type === 'buy' ? 'Compra' : 'Venda',
            tx.crypto.toUpperCase(),
            tx.amount.toFixed(8),
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

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Destroy chart instances
        Object.values(this.chartInstances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        this.isInitialized = false;
    }
}

// Initialize Crypto Manager
let cryptoManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cryptoManager = new CryptoManager();
    });
} else {
    cryptoManager = new CryptoManager();
}

// Export for global access
if (typeof window !== 'undefined') {
    window.CryptoManager = CryptoManager;
    window.cryptoManager = cryptoManager;
}

