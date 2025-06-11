// Main Dashboard Application
class Dashboard {
    constructor() {
        this.isInitialized = false;
        this.currentSection = 'dashboard';
        this.theme = 'light';
        this.managers = {};
        this.intervalIds = [];
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize core systems
            await this.initializeCore();
            
            // Initialize managers
            await this.initializeManagers();
            
            // Setup UI
            this.setupUI();
            
            // Load saved theme
            this.loadTheme();
            
            // Update current time
            this.updateDateTime();
            this.startDateTimeUpdater();
            
            // Initialize dashboard charts
            await this.initializeDashboardCharts();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.log('Dashboard initialized successfully');
            
        } catch (error) {
            ERROR_HANDLER.log(error, 'Dashboard.init');
            this.showErrorMessage('Erro ao inicializar dashboard');
        }
    }

    async initializeCore() {
        // Initialize configuration
        if (typeof APP_CONFIG === 'undefined') {
            throw new Error('Configuration not loaded');
        }
        
        // Check required dependencies
        const requiredLibs = ['Chart', 'axios'];
        for (const lib of requiredLibs) {
            if (typeof window[lib] === 'undefined') {
                console.warn(`${lib} not loaded, some features may not work`);
            }
        }
    }

    async initializeManagers() {
        // Wait for managers to be available
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            if (window.cryptoManager && window.stocksManager && 
                window.aiBot && window.chartsManager) {
                this.managers = {
                    crypto: window.cryptoManager,
                    stocks: window.stocksManager,
                    ai: window.aiBot,
                    charts: window.chartsManager
                };
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (attempts >= maxAttempts) {
            console.warn('Some managers not available, continuing with limited functionality');
        }
    }

    setupUI() {
        this.bindNavigationEvents();
        this.bindGlobalEvents();
        this.setupModals();
        this.setupNotifications();
    }

    bindNavigationEvents() {
        // Sidebar navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });
    }

    bindGlobalEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Notifications button
        const notificationsBtn = document.getElementById('notifications-btn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                this.showNotificationsModal();
            });
        }

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for AI search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusAIInput();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Export buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-export-pdf')) {
                this.exportToPDF();
            }
            if (e.target.classList.contains('btn-export-csv')) {
                this.exportToCSV();
            }
        });
    }

    setupModals() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Close button functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        });
    }

    setupNotifications() {
        // Request notification permission if supported
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        this.currentSection = sectionName;
        
        // Initialize section-specific content
        this.initializeSection(sectionName);
    }

    async initializeSection(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                await this.initializeDashboardCharts();
                break;
            case 'crypto':
                if (this.managers.crypto) {
                    await this.managers.crypto.updateCryptoData();
                }
                break;
            case 'stocks':
                if (this.managers.stocks) {
                    await this.managers.stocks.updateStocksData();
                }
                break;
            case 'ai-bot':
                if (this.managers.ai) {
                    await this.managers.ai.updateMarketContext();
                }
                break;
            case 'reports':
                await this.initializeReportsCharts();
                break;
        }
    }

    async initializeDashboardCharts() {
        if (this.managers.charts) {
            await this.managers.charts.initializeDashboardCharts();
        }
    }

    async initializeReportsCharts() {
        if (this.managers.charts) {
            await this.managers.charts.initializeReportsCharts();
        }
    }

    // Theme Management
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
        
        // Dispatch theme change event
        document.dispatchEvent(new CustomEvent('themeChange', {
            detail: { theme: this.theme }
        }));
    }

    loadTheme() {
        const savedTheme = CONFIG_UTILS.loadFromStorage('theme', 'light');
        this.theme = savedTheme;
        this.applyTheme();
    }

    saveTheme() {
        CONFIG_UTILS.saveToStorage('theme', this.theme);
    }

    // Date and Time
    updateDateTime() {
        const now = new Date();
        const formatted = CONFIG_UTILS.formatDate(now, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const dateTimeElement = document.getElementById('current-datetime');
        if (dateTimeElement) {
            dateTimeElement.textContent = formatted;
        }
    }

    startDateTimeUpdater() {
        const intervalId = setInterval(() => {
            this.updateDateTime();
        }, 60000); // Update every minute
        
        this.intervalIds.push(intervalId);
    }

    // Loading Screen
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    }

    // Error Handling
    showErrorMessage(message) {
        ERROR_HANDLER.notify(message, 'error');
        this.hideLoadingScreen();
    }

    // Notifications
    showNotificationsModal() {
        const modal = document.getElementById('notification-modal');
        if (modal) {
            this.populateNotifications();
            modal.style.display = 'block';
        }
    }

    populateNotifications() {
        const notificationsList = document.getElementById('notifications-list');
        if (!notificationsList) return;

        // Mock notifications - in production, load from storage or API
        const notifications = [
            {
                id: 1,
                type: 'price_alert',
                title: 'Bitcoin atingiu R$ 350.000',
                message: 'O preço do Bitcoin ultrapassou seu alerta configurado.',
                timestamp: Date.now() - 300000, // 5 minutes ago
                read: false
            },
            {
                id: 2,
                type: 'ai_recommendation',
                title: 'Nova recomendação da IA',
                message: 'Consider diversificar para o setor de tecnologia.',
                timestamp: Date.now() - 1800000, // 30 minutes ago
                read: false
            },
            {
                id: 3,
                type: 'market_update',
                title: 'Mercado em alta',
                message: 'Bovespa apresenta ganhos de 2.5% no dia.',
                timestamp: Date.now() - 3600000, // 1 hour ago
                read: true
            }
        ];

        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <small>${CONFIG_UTILS.formatDate(new Date(notification.timestamp))}</small>
                </div>
            </div>
        `).join('');
    }

    getNotificationIcon(type) {
        const icons = {
            price_alert: 'chart-line',
            ai_recommendation: 'robot',
            market_update: 'newspaper',
            trade_executed: 'check-circle'
        };
        return icons[type] || 'bell';
    }

    // AI Integration
    focusAIInput() {
        this.switchSection('ai-bot');
        setTimeout(() => {
            const aiInput = document.getElementById('ai-input');
            if (aiInput) {
                aiInput.focus();
            }
        }, 300);
    }

    // Modal Management
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Export Functions
    async exportToPDF() {
        try {
            // Mock PDF export - in production, use a library like jsPDF
            const data = this.gatherDashboardData();
            
            // Create a simple report
            const report = this.generateReport(data);
            
            ERROR_HANDLER.notify('Relatório PDF em desenvolvimento', 'info');
            console.log('PDF Export Data:', report);
            
        } catch (error) {
            ERROR_HANDLER.log(error, 'Dashboard.exportToPDF');
            ERROR_HANDLER.notify('Erro ao gerar PDF', 'error');
        }
    }

    async exportToCSV() {
        try {
            const data = this.gatherDashboardData();
            const csv = this.convertToCSV(data);
            this.downloadCSV(csv, 'dashboard_export.csv');
            
            ERROR_HANDLER.notify('Dados exportados com sucesso', 'success');
            
        } catch (error) {
            ERROR_HANDLER.log(error, 'Dashboard.exportToCSV');
            ERROR_HANDLER.notify('Erro ao exportar CSV', 'error');
        }
    }

    gatherDashboardData() {
        return {
            timestamp: new Date().toISOString(),
            portfolio: this.managers.stocks?.getPortfolioSummary() || {},
            crypto: this.managers.crypto?.getPortfolioSummary() || {},
            performance: this.calculatePerformance()
        };
    }

    calculatePerformance() {
        // Mock performance calculation
        return {
            totalReturn: 5.2,
            monthlyReturn: 1.8,
            yearToDate: 12.5
        };
    }

    generateReport(data) {
        return {
            title: 'Relatório Financeiro - Mercado Neural',
            date: CONFIG_UTILS.formatDate(new Date()),
            summary: {
                totalAssets: data.portfolio.totalValue + data.crypto.totalValue,
                performance: data.performance,
                diversification: this.analyzeDiversification(data)
            },
            details: data
        };
    }

    analyzeDiversification(data) {
        const total = data.portfolio.totalValue + data.crypto.totalValue;
        return {
            stocks: ((data.portfolio.totalValue / total) * 100).toFixed(1),
            crypto: ((data.crypto.totalValue / total) * 100).toFixed(1),
            cash: '10.0', // Mock data
            fixedIncome: '15.0' // Mock data
        };
    }

    convertToCSV(data) {
        const headers = ['Data', 'Tipo', 'Valor', 'Percentual'];
        const rows = [
            [data.timestamp, 'Ações', data.portfolio.totalValue || 0, '60%'],
            [data.timestamp, 'Criptomoedas', data.crypto.totalValue || 0, '30%'],
            [data.timestamp, 'Caixa', 15000, '10%']
        ];
        
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

    // Performance Monitoring
    getSystemMetrics() {
        return {
            performance: PERFORMANCE_MONITOR.marks,
            errors: CONFIG_UTILS.loadFromStorage('error_logs', []),
            managers: {
                crypto: this.managers.crypto?.isInitialized || false,
                stocks: this.managers.stocks?.isInitialized || false,
                ai: this.managers.ai?.isInitialized || false,
                charts: this.managers.charts?.isInitialized || false
            },
            currentSection: this.currentSection,
            theme: this.theme
        };
    }

    // Cleanup
    destroy() {
        // Clear intervals
        this.intervalIds.forEach(id => clearInterval(id));
        
        // Destroy managers
        Object.values(this.managers).forEach(manager => {
            if (manager && typeof manager.destroy === 'function') {
                manager.destroy();
            }
        });
        
        this.isInitialized = false;
        console.log('Dashboard destroyed');
    }
}

// Initialize Dashboard when DOM is ready
let dashboard;

function initializeDashboard() {
    dashboard = new Dashboard();
    
    // Global error handler
    window.addEventListener('error', (event) => {
        ERROR_HANDLER.log(event.error, 'Global Error');
    });
    
    // Global unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        ERROR_HANDLER.log(event.reason, 'Unhandled Promise Rejection');
    });
    
    // Expose dashboard globally for debugging
    window.dashboard = dashboard;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

// Service Worker Registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}

