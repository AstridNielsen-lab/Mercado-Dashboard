// Sistema de Integração com APIs
class ApiService {
    constructor() {
        this.cache = new Map();
        this.rateLimits = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
    }

    // Rate limiting
    async checkRateLimit(apiName) {
        const now = Date.now();
        const limits = this.rateLimits.get(apiName) || { requests: 0, resetTime: now + 60000 };
        
        if (now > limits.resetTime) {
            limits.requests = 0;
            limits.resetTime = now + 60000;
        }
        
        if (limits.requests >= 60) { // 60 requests per minute
            throw new Error(`Rate limit exceeded for ${apiName}`);
        }
        
        limits.requests++;
        this.rateLimits.set(apiName, limits);
        return true;
    }

    // Cache management
    getCached(key, maxAge = 30000) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < maxAge) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Generic HTTP request with error handling
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            ERROR_HANDLER.log(error, `API Request: ${url}`);
            throw error;
        }
    }
}

// CoinGecko API Integration
class CryptoAPI extends ApiService {
    constructor() {
        super();
        this.baseUrl = APP_CONFIG.APIS.COINGECKO.BASE_URL;
    }

    async getCryptoPrices(coins = ['bitcoin', 'ethereum', 'litecoin']) {
        try {
            await this.checkRateLimit('coingecko');
            
            const cacheKey = `crypto_prices_${coins.join(',')}`;
            const cached = this.getCached(cacheKey);
            if (cached) return cached;

            const coinsParam = coins.join(',');
            const url = `${this.baseUrl}/simple/price?ids=${coinsParam}&vs_currencies=brl,usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
            
            const data = await this.request(url);
            this.setCache(cacheKey, data);
            
            return data;
        } catch (error) {
            ERROR_HANDLER.log(error, 'CryptoAPI.getCryptoPrices');
            return this.getMockCryptoData();
        }
    }

    async getCryptoChart(coinId, days = 1) {
        try {
            await this.checkRateLimit('coingecko');
            
            const cacheKey = `crypto_chart_${coinId}_${days}`;
            const cached = this.getCached(cacheKey, 300000); // 5 min cache
            if (cached) return cached;

            const url = `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=brl&days=${days}`;
            const data = await this.request(url);
            
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            ERROR_HANDLER.log(error, `CryptoAPI.getCryptoChart: ${coinId}`);
            return this.getMockChartData();
        }
    }

    async getMarketData() {
        try {
            await this.checkRateLimit('coingecko');
            
            const cacheKey = 'crypto_market_data';
            const cached = this.getCached(cacheKey, 60000); // 1 min cache
            if (cached) return cached;

            const url = `${this.baseUrl}/global`;
            const data = await this.request(url);
            
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            ERROR_HANDLER.log(error, 'CryptoAPI.getMarketData');
            return null;
        }
    }

    getMockCryptoData() {
        return {
            bitcoin: {
                brl: 330000 + (Math.random() - 0.5) * 10000,
                usd: 65000 + (Math.random() - 0.5) * 2000,
                brl_24h_change: (Math.random() - 0.5) * 10,
                brl_market_cap: 6500000000000,
                brl_24h_vol: 45000000000
            },
            ethereum: {
                brl: 18000 + (Math.random() - 0.5) * 1000,
                usd: 3500 + (Math.random() - 0.5) * 200,
                brl_24h_change: (Math.random() - 0.5) * 8,
                brl_market_cap: 2200000000000,
                brl_24h_vol: 25000000000
            },
            litecoin: {
                brl: 450 + (Math.random() - 0.5) * 50,
                usd: 85 + (Math.random() - 0.5) * 10,
                brl_24h_change: (Math.random() - 0.5) * 6,
                brl_market_cap: 33000000000,
                brl_24h_vol: 2000000000
            }
        };
    }

    getMockChartData() {
        const data = [];
        const now = Date.now();
        const basePrice = 330000;
        
        for (let i = 0; i < 24; i++) {
            const timestamp = now - (24 - i) * 3600000;
            const price = basePrice + (Math.random() - 0.5) * 10000;
            data.push([timestamp, price]);
        }
        
        return { prices: data };
    }
}

// Yahoo Finance API Integration
class StocksAPI extends ApiService {
    constructor() {
        super();
        this.baseUrl = APP_CONFIG.APIS.YAHOO_FINANCE.BASE_URL;
    }

    async getStockPrice(symbol) {
        try {
            await this.checkRateLimit('yahoo_finance');
            
            const cacheKey = `stock_${symbol}`;
            const cached = this.getCached(cacheKey, 60000); // 1 min cache
            if (cached) return cached;

            const url = `${this.baseUrl}/${symbol}?interval=1d&range=1d`;
            const data = await this.request(url);
            
            if (data.chart && data.chart.result && data.chart.result[0]) {
                const result = data.chart.result[0];
                const meta = result.meta;
                const quote = result.indicators.quote[0];
                
                const stockData = {
                    symbol: meta.symbol,
                    price: meta.regularMarketPrice,
                    change: meta.regularMarketPrice - meta.previousClose,
                    changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
                    volume: meta.regularMarketVolume,
                    marketCap: meta.marketCap || 0,
                    timestamp: Date.now()
                };
                
                this.setCache(cacheKey, stockData);
                return stockData;
            }
            
            throw new Error('Invalid response format');
        } catch (error) {
            ERROR_HANDLER.log(error, `StocksAPI.getStockPrice: ${symbol}`);
            return this.getMockStockData(symbol);
        }
    }

    async getMultipleStocks(symbols) {
        const promises = symbols.map(symbol => this.getStockPrice(symbol));
        const results = await Promise.allSettled(promises);
        
        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                ERROR_HANDLER.log(result.reason, `Failed to fetch ${symbols[index]}`);
                return this.getMockStockData(symbols[index]);
            }
        });
    }

    getMockStockData(symbol) {
        const baseData = {
            'PETR4.SA': { price: 35.50, volume: 45000000 },
            'VALE3.SA': { price: 65.20, volume: 32000000 },
            'ITUB4.SA': { price: 25.80, volume: 28000000 },
            'BBDC4.SA': { price: 20.45, volume: 22000000 },
            'AAPL': { price: 180.50, volume: 55000000 },
            'GOOGL': { price: 2750.30, volume: 18000000 },
            'MSFT': { price: 420.80, volume: 25000000 }
        };
        
        const base = baseData[symbol] || { price: 100, volume: 1000000 };
        const change = (Math.random() - 0.5) * base.price * 0.05;
        
        return {
            symbol,
            price: base.price + change,
            change: change,
            changePercent: (change / base.price) * 100,
            volume: base.volume + (Math.random() - 0.5) * base.volume * 0.2,
            marketCap: base.price * 1000000000,
            timestamp: Date.now()
        };
    }
}

// Google Gemini AI API Integration
class GeminiAPI extends ApiService {
    constructor() {
        super();
        this.apiUrl = APP_CONFIG.APIS.GEMINI.API_URL;
        this.apiKey = APP_CONFIG.APIS.GEMINI.API_KEY;
    }

    async generateContent(prompt, context = {}) {
        try {
            await this.checkRateLimit('gemini');
            
            const enhancedPrompt = this.buildPrompt(prompt, context);
            
            const response = await this.request(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: enhancedPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (response.candidates && response.candidates[0]) {
                return response.candidates[0].content.parts[0].text;
            }
            
            throw new Error('Invalid response from Gemini API');
        } catch (error) {
            ERROR_HANDLER.log(error, 'GeminiAPI.generateContent');
            return this.getFallbackResponse(prompt);
        }
    }

    buildPrompt(userPrompt, context) {
        const systemContext = `
Você é um assistente especialista em investimentos e finanças. 
Responda de forma profissional, clara e objetiva em português brasileiro.
Foque em análises baseadas em dados e evite recomendações muito arriscadas.

Contexto atual do mercado:
${context.marketData ? JSON.stringify(context.marketData, null, 2) : 'Dados não disponíveis'}

Portfólio do usuário:
${context.portfolio ? JSON.stringify(context.portfolio, null, 2) : 'Não disponível'}

Pergunta do usuário: ${userPrompt}

Resposta:`;

        return systemContext;
    }

    getFallbackResponse(prompt) {
        const responses = {
            'bitcoin': 'Com base na análise atual, o Bitcoin apresenta volatilidade normal. Recomendo acompanhar os níveis de suporte e resistência antes de tomar decisões.',
            'ações': 'O mercado de ações brasileiro está mostrando sinais mistos. Considere diversificação entre setores defensivos e crescimento.',
            'diversificar': 'Para uma carteira bem diversificada, considere: 60% ações, 25% renda fixa, 10% criptomoedas e 5% em reserva de emergência.',
            'risco': 'Sua carteira apresenta nível de risco moderado. Considere rebalanceamento trimestral e acompanhamento de indicadores econômicos.'
        };
        
        const key = Object.keys(responses).find(k => prompt.toLowerCase().includes(k));
        return responses[key] || 'Desculpe, não foi possível processar sua solicitação no momento. Tente novamente em alguns instantes.';
    }
}

// MercadoPago API Integration
class PaymentAPI extends ApiService {
    constructor() {
        super();
        this.accessToken = APP_CONFIG.APIS.MERCADOPAGO.ACCESS_TOKEN;
        this.baseUrl = 'https://api.mercadopago.com';
    }

    async getAccountInfo() {
        try {
            await this.checkRateLimit('mercadopago');
            
            const cacheKey = 'mp_account_info';
            const cached = this.getCached(cacheKey, 300000); // 5 min cache
            if (cached) return cached;

            const response = await this.request(`${this.baseUrl}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            this.setCache(cacheKey, response);
            return response;
        } catch (error) {
            ERROR_HANDLER.log(error, 'PaymentAPI.getAccountInfo');
            return null;
        }
    }

    async getBalance() {
        try {
            await this.checkRateLimit('mercadopago');
            
            const response = await this.request(`${this.baseUrl}/users/me/mercadopago_account/balance`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            return response;
        } catch (error) {
            ERROR_HANDLER.log(error, 'PaymentAPI.getBalance');
            return { available_balance: 0, total_amount: 0 };
        }
    }
}

// Initialize API services
const cryptoAPI = new CryptoAPI();
const stocksAPI = new StocksAPI();
const geminiAPI = new GeminiAPI();
const paymentAPI = new PaymentAPI();

// Export APIs
if (typeof window !== 'undefined') {
    window.CryptoAPI = cryptoAPI;
    window.StocksAPI = stocksAPI;
    window.GeminiAPI = geminiAPI;
    window.PaymentAPI = paymentAPI;
}

