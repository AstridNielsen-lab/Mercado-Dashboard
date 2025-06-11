// Configurações da Dashboard Financeira
const APP_CONFIG = {
    // APIs Configuração
    // ⚠️ IMPORTANTE: Substitua os valores pelos suas chaves reais
    // Nunca exponha chaves de API em repositórios públicos!
    APIS: {
        MERCADOPAGO: {
            PUBLIC_KEY: 'YOUR_MERCADOPAGO_PUBLIC_KEY_HERE',
            ACCESS_TOKEN: 'YOUR_MERCADOPAGO_ACCESS_TOKEN_HERE',
            CLIENT_ID: 'YOUR_MERCADOPAGO_CLIENT_ID_HERE',
            CLIENT_SECRET: 'YOUR_MERCADOPAGO_CLIENT_SECRET_HERE'
        },
        GEMINI: {
            API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
            API_KEY: 'YOUR_GEMINI_API_KEY_HERE'
        },
        COINGECKO: {
            BASE_URL: 'https://api.coingecko.com/api/v3',
            API_KEY: null // Free tier
        },
        ALPHA_VANTAGE: {
            BASE_URL: 'https://www.alphavantage.co/query',
            API_KEY: 'YOUR_ALPHA_VANTAGE_API_KEY_HERE' // Obtenha em: https://www.alphavantage.co/support/#api-key
        },
        YAHOO_FINANCE: {
            BASE_URL: 'https://query1.finance.yahoo.com/v8/finance/chart'
        }
    },
    
    // Wallets Configuration
    // ⚠️ IMPORTANTE: Configure com seus próprios endereços de carteira
    WALLETS: {
        PIX: {
            email: 'seu-email@exemplo.com',
            type: 'pix'
        },
        PAYPAL: {
            email: 'seu-email@exemplo.com',
            type: 'paypal'
        },
        BITCOIN: {
            address: 'seu_endereco_bitcoin_aqui',
            symbol: 'BTC',
            name: 'Bitcoin'
        },
        ETHEREUM: {
            address: 'seu_endereco_ethereum_aqui',
            symbol: 'ETH',
            name: 'Ethereum'
        },
        LITECOIN: {
            address: 'seu_endereco_litecoin_aqui',
            symbol: 'LTC',
            name: 'Litecoin'
        }
    },
    
    // Crypto Configuration
    CRYPTO: {
        SUPPORTED_COINS: ['bitcoin', 'ethereum', 'litecoin', 'cardano', 'polkadot', 'chainlink'],
        CURRENCY: 'brl',
        UPDATE_INTERVAL: 30000, // 30 seconds
        TIMEFRAMES: {
            '24h': '1',
            '7d': '7',
            '30d': '30'
        }
    },
    
    // Stocks Configuration
    STOCKS: {
        BRAZILIAN_STOCKS: ['PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBDC4.SA', 'ABEV3.SA', 'WEGE3.SA'],
        US_STOCKS: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA'],
        UPDATE_INTERVAL: 60000, // 1 minute
        MARKET_HOURS: {
            BOVESPA: { open: '10:00', close: '17:30', timezone: 'America/Sao_Paulo' },
            NYSE: { open: '09:30', close: '16:00', timezone: 'America/New_York' }
        }
    },
    
    // AI Configuration
    AI: {
        MAX_CONTEXT_LENGTH: 4000,
        RESPONSE_TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3,
        ANALYSIS_INDICATORS: {
            RSI: true,
            MACD: true,
            BOLLINGER: true,
            MOVING_AVERAGES: true
        }
    },
    
    // UI Configuration
    UI: {
        THEME: 'light', // 'light' | 'dark' | 'auto'
        LANGUAGE: 'pt-BR',
        CURRENCY_FORMAT: 'BRL',
        NOTIFICATIONS: {
            ENABLED: true,
            PRICE_ALERTS: true,
            AI_RECOMMENDATIONS: true,
            SOUND: false
        },
        REFRESH_INTERVALS: {
            DASHBOARD: 30000,
            CRYPTO: 30000,
            STOCKS: 60000,
            PORTFOLIO: 300000 // 5 minutes
        }
    },
    
    // Data Storage
    STORAGE: {
        PREFIX: 'mercado_neural_',
        ENCRYPTION: true,
        SYNC_CLOUD: false
    },
    
    // Features Flags
    FEATURES: {
        REAL_TRADING: false, // Set to true for production
        AI_PREDICTIONS: true,
        PORTFOLIO_ANALYTICS: true,
        EXPORT_REPORTS: true,
        NOTIFICATIONS: true,
        DARK_MODE: true
    }
};

// Utility Functions
const CONFIG_UTILS = {
    // Get API configuration
    getApiConfig: (apiName) => {
        return APP_CONFIG.APIS[apiName.toUpperCase()] || null;
    },
    
    // Check if feature is enabled
    isFeatureEnabled: (featureName) => {
        return APP_CONFIG.FEATURES[featureName.toUpperCase()] || false;
    },
    
    // Get wallet configuration
    getWalletConfig: (walletName) => {
        return APP_CONFIG.WALLETS[walletName.toUpperCase()] || null;
    },
    
    // Format currency
    formatCurrency: (amount, currency = 'BRL') => {
        const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency
        });
        return formatter.format(amount);
    },
    
    // Format percentage
    formatPercentage: (value, decimals = 2) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
    },
    
    // Get storage key
    getStorageKey: (key) => {
        return `${APP_CONFIG.STORAGE.PREFIX}${key}`;
    },
    
    // Save to localStorage with encryption
    saveToStorage: (key, data) => {
        try {
            const storageKey = CONFIG_UTILS.getStorageKey(key);
            const jsonData = JSON.stringify(data);
            
            if (APP_CONFIG.STORAGE.ENCRYPTION) {
                // Simple base64 encoding (not secure, use proper encryption in production)
                const encoded = btoa(jsonData);
                localStorage.setItem(storageKey, encoded);
            } else {
                localStorage.setItem(storageKey, jsonData);
            }
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    },
    
    // Load from localStorage with decryption
    loadFromStorage: (key, defaultValue = null) => {
        try {
            const storageKey = CONFIG_UTILS.getStorageKey(key);
            const stored = localStorage.getItem(storageKey);
            
            if (!stored) return defaultValue;
            
            let jsonData;
            if (APP_CONFIG.STORAGE.ENCRYPTION) {
                // Simple base64 decoding
                jsonData = atob(stored);
            } else {
                jsonData = stored;
            }
            
            return JSON.parse(jsonData);
        } catch (error) {
            console.error('Error loading from storage:', error);
            return defaultValue;
        }
    },
    
    // Get current timestamp
    getCurrentTimestamp: () => {
        return new Date().toISOString();
    },
    
    // Format date for display
    formatDate: (date, options = {}) => {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Date(date).toLocaleDateString('pt-BR', {
            ...defaultOptions,
            ...options
        });
    },
    
    // Check if market is open
    isMarketOpen: (market = 'BOVESPA') => {
        const now = new Date();
        const marketConfig = APP_CONFIG.STOCKS.MARKET_HOURS[market];
        
        if (!marketConfig) return false;
        
        // Simplified check - in production, consider timezone and holidays
        const currentHour = now.getHours();
        const openHour = parseInt(marketConfig.open.split(':')[0]);
        const closeHour = parseInt(marketConfig.close.split(':')[0]);
        
        return currentHour >= openHour && currentHour < closeHour;
    },
    
    // Validate API key format
    validateApiKey: (apiName, key) => {
        const patterns = {
            GEMINI: /^AIza[0-9A-Za-z\-_]{35}$/,
            MERCADOPAGO: /^APP_USR-\d+-[a-f0-9-]+$/
        };
        
        const pattern = patterns[apiName.toUpperCase()];
        return pattern ? pattern.test(key) : true;
    },
    
    // Generate unique ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Deep clone object
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Error Handler
const ERROR_HANDLER = {
    log: (error, context = '') => {
        const timestamp = new Date().toISOString();
        const errorLog = {
            timestamp,
            context,
            message: error.message || error,
            stack: error.stack || null
        };
        
        console.error('[Error Log]', errorLog);
        
        // Save to storage for debugging
        const errors = CONFIG_UTILS.loadFromStorage('error_logs', []);
        errors.push(errorLog);
        
        // Keep only last 50 errors
        if (errors.length > 50) {
            errors.splice(0, errors.length - 50);
        }
        
        CONFIG_UTILS.saveToStorage('error_logs', errors);
    },
    
    notify: (message, type = 'error') => {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
};

// Performance Monitor
const PERFORMANCE_MONITOR = {
    marks: {},
    
    start: (label) => {
        PERFORMANCE_MONITOR.marks[label] = performance.now();
    },
    
    end: (label) => {
        const startTime = PERFORMANCE_MONITOR.marks[label];
        if (startTime) {
            const duration = performance.now() - startTime;
            console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
            delete PERFORMANCE_MONITOR.marks[label];
            return duration;
        }
        return null;
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_CONFIG,
        CONFIG_UTILS,
        ERROR_HANDLER,
        PERFORMANCE_MONITOR
    };
}

