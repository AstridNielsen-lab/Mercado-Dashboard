// Charts Management System
class ChartsManager {
    constructor() {
        this.charts = {};
        this.isInitialized = false;
        this.init();
    }

    init() {
        this.setupChartDefaults();
        this.bindEvents();
        this.isInitialized = true;
        console.log('Charts Manager initialized successfully');
    }

    setupChartDefaults() {
        // Configure Chart.js defaults
        if (typeof Chart !== 'undefined') {
            Chart.defaults.font.family = 'Inter, sans-serif';
            Chart.defaults.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--text-primary').trim() || '#2c3e50';
            Chart.defaults.plugins.legend.display = true;
            Chart.defaults.plugins.tooltip.enabled = true;
            Chart.defaults.responsive = true;
            Chart.defaults.maintainAspectRatio = false;
        }
    }

    bindEvents() {
        // Theme change listener
        document.addEventListener('themeChange', () => {
            this.updateChartsTheme();
        });

        // Window resize listener
        window.addEventListener('resize', 
            CONFIG_UTILS.debounce(() => this.resizeAllCharts(), 300)
        );
    }

    // Portfolio Evolution Chart
    async createPortfolioChart() {
        const canvas = document.getElementById('portfolio-chart');
        if (!canvas) return null;

        // Destroy existing chart
        if (this.charts.portfolio) {
            this.charts.portfolio.destroy();
        }

        const data = await this.generatePortfolioData();
        
        this.charts.portfolio = new Chart(canvas, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução do Patrimônio (30 dias)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
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
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            displayFormats: {
                                day: 'MMM dd'
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
                        beginAtZero: false,
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
                },
                elements: {
                    line: {
                        tension: 0.2
                    },
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                }
            }
        });

        return this.charts.portfolio;
    }

    // Asset Allocation Pie Chart
    async createAllocationChart() {
        const canvas = document.getElementById('allocation-chart');
        if (!canvas) return null;

        // Destroy existing chart
        if (this.charts.allocation) {
            this.charts.allocation.destroy();
        }

        const data = await this.generateAllocationData();
        
        this.charts.allocation = new Chart(canvas, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição de Ativos',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            generateLabels: function(chart) {
                                const data = chart.data;
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return {
                                        text: `${label}: ${percentage}%`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        strokeStyle: data.datasets[0].borderColor[i],
                                        lineWidth: 2,
                                        pointStyle: 'circle'
                                    };
                                });
                            }
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
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${CONFIG_UTILS.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                elements: {
                    arc: {
                        borderWidth: 2
                    }
                }
            }
        });

        return this.charts.allocation;
    }

    // Monthly Performance Chart
    async createMonthlyPerformanceChart() {
        const canvas = document.getElementById('monthly-performance-chart');
        if (!canvas) return null;

        // Destroy existing chart
        if (this.charts.monthlyPerformance) {
            this.charts.monthlyPerformance.destroy();
        }

        const data = await this.generateMonthlyPerformanceData();
        
        this.charts.monthlyPerformance = new Chart(canvas, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance Mensal (%)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#666',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `Performance: ${context.parsed.y.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            color: '#666',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                elements: {
                    bar: {
                        borderRadius: 4,
                        borderSkipped: false
                    }
                }
            }
        });

        return this.charts.monthlyPerformance;
    }

    // Generate portfolio evolution data
    async generatePortfolioData() {
        // Get historical data or generate mock data
        const days = 30;
        const now = new Date();
        const portfolioHistory = [];
        const cryptoHistory = [];
        const stocksHistory = [];
        
        // Generate mock historical data
        let basePortfolio = 100000; // Starting value
        let baseCrypto = 40000;
        let baseStocks = 60000;
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            
            // Add some random variation
            const variation = (Math.random() - 0.5) * 0.05; // ±2.5% daily variation
            
            basePortfolio *= (1 + variation);
            baseCrypto *= (1 + variation * 1.5); // Crypto more volatile
            baseStocks *= (1 + variation * 0.7); // Stocks less volatile
            
            portfolioHistory.push({ x: date, y: basePortfolio });
            cryptoHistory.push({ x: date, y: baseCrypto });
            stocksHistory.push({ x: date, y: baseStocks });
        }

        return {
            datasets: [
                {
                    label: 'Patrimônio Total',
                    data: portfolioHistory,
                    borderColor: '#2d5a87',
                    backgroundColor: 'rgba(45, 90, 135, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.2
                },
                {
                    label: 'Criptomoedas',
                    data: cryptoHistory,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2
                },
                {
                    label: 'Ações',
                    data: stocksHistory,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2
                }
            ]
        };
    }

    // Generate asset allocation data
    async generateAllocationData() {
        // Get current portfolio values
        const cryptoSummary = window.cryptoManager ? 
            window.cryptoManager.getPortfolioSummary() : { totalValue: 45000 };
        
        const stocksSummary = window.stocksManager ? 
            window.stocksManager.getPortfolioSummary() : { totalValue: 65000 };
        
        // Mock cash and other investments
        const cash = 15000;
        const fixedIncome = 25000;
        
        const total = cryptoSummary.totalValue + stocksSummary.totalValue + cash + fixedIncome;
        
        return {
            labels: ['Criptomoedas', 'Ações', 'Renda Fixa', 'Caixa'],
            datasets: [{
                data: [
                    cryptoSummary.totalValue,
                    stocksSummary.totalValue,
                    fixedIncome,
                    cash
                ],
                backgroundColor: [
                    '#f39c12',
                    '#27ae60',
                    '#3498db',
                    '#95a5a6'
                ],
                borderColor: [
                    '#e67e22',
                    '#229954',
                    '#2980b9',
                    '#7f8c8d'
                ],
                borderWidth: 2,
                hoverOffset: 4
            }]
        };
    }

    // Generate monthly performance data
    async generateMonthlyPerformanceData() {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                       'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        // Generate mock performance data
        const performance = [];
        const colors = [];
        
        for (let i = 0; i < 12; i++) {
            const perf = (Math.random() - 0.3) * 20; // Random performance between -6% and +14%
            performance.push(perf);
            colors.push(perf >= 0 ? '#27ae60' : '#e74c3c');
        }
        
        return {
            labels: months,
            datasets: [{
                data: performance,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 4
            }]
        };
    }

    // Update all charts when theme changes
    updateChartsTheme() {
        const textColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--text-primary').trim() || '#2c3e50';
        
        Chart.defaults.color = textColor;
        
        // Update existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.options) {
                // Update text colors
                if (chart.options.plugins?.title) {
                    chart.options.plugins.title.color = textColor;
                }
                if (chart.options.plugins?.legend?.labels) {
                    chart.options.plugins.legend.labels.color = textColor;
                }
                if (chart.options.scales) {
                    Object.values(chart.options.scales).forEach(scale => {
                        if (scale.ticks) {
                            scale.ticks.color = textColor;
                        }
                    });
                }
                
                chart.update('none');
            }
        });
    }

    // Resize all charts
    resizeAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    // Initialize all dashboard charts
    async initializeDashboardCharts() {
        try {
            await Promise.all([
                this.createPortfolioChart(),
                this.createAllocationChart()
            ]);
            
            console.log('Dashboard charts initialized successfully');
        } catch (error) {
            ERROR_HANDLER.log(error, 'ChartsManager.initializeDashboardCharts');
        }
    }

    // Initialize reports charts
    async initializeReportsCharts() {
        try {
            await this.createMonthlyPerformanceChart();
            
            console.log('Reports charts initialized successfully');
        } catch (error) {
            ERROR_HANDLER.log(error, 'ChartsManager.initializeReportsCharts');
        }
    }

    // Export chart as image
    exportChart(chartId, filename = 'chart.png') {
        const chart = this.charts[chartId];
        if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Update chart data
    updateChartData(chartId, newData) {
        const chart = this.charts[chartId];
        if (chart) {
            chart.data = newData;
            chart.update('active');
        }
    }

    // Add data point to chart
    addDataPoint(chartId, label, data) {
        const chart = this.charts[chartId];
        if (chart) {
            chart.data.labels.push(label);
            chart.data.datasets.forEach((dataset, index) => {
                dataset.data.push(data[index] || 0);
            });
            chart.update('active');
        }
    }

    // Remove data point from chart
    removeDataPoint(chartId, index = -1) {
        const chart = this.charts[chartId];
        if (chart) {
            chart.data.labels.splice(index, 1);
            chart.data.datasets.forEach(dataset => {
                dataset.data.splice(index, 1);
            });
            chart.update('active');
        }
    }

    // Animate chart
    animateChart(chartId) {
        const chart = this.charts[chartId];
        if (chart) {
            chart.update('show');
        }
    }

    // Get chart data
    getChartData(chartId) {
        const chart = this.charts[chartId];
        return chart ? chart.data : null;
    }

    // Destroy specific chart
    destroyChart(chartId) {
        const chart = this.charts[chartId];
        if (chart) {
            chart.destroy();
            delete this.charts[chartId];
        }
    }

    // Destroy all charts
    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartId => {
            this.destroyChart(chartId);
        });
    }

    // Get chart performance metrics
    getPerformanceMetrics() {
        return {
            totalCharts: Object.keys(this.charts).length,
            activeCharts: Object.values(this.charts).filter(chart => chart !== null).length,
            lastUpdate: new Date().toISOString()
        };
    }
}

// Initialize Charts Manager
let chartsManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        chartsManager = new ChartsManager();
    });
} else {
    chartsManager = new ChartsManager();
}

// Export for global access
if (typeof window !== 'undefined') {
    window.ChartsManager = ChartsManager;
    window.chartsManager = chartsManager;
}

