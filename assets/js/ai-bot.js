// AI Bot System
class AIBot {
    constructor() {
        this.isInitialized = false;
        this.conversationHistory = [];
        this.currentContext = {};
        this.isTyping = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadConversationHistory();
        this.updateMarketContext();
        this.isInitialized = true;
        console.log('AI Bot initialized successfully');
    }

    bindEvents() {
        // Send message on Enter key
        const input = document.getElementById('ai-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Send button click
        const sendBtn = document.getElementById('send-ai-message');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Quick questions
        const quickQuestions = document.querySelectorAll('.quick-question');
        quickQuestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                this.askQuestion(question);
            });
        });
    }

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Clear input
        input.value = '';
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add AI response to chat
            this.addMessage(response, 'ai');
            
            // Save conversation
            this.saveConversation();
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.', 'ai');
            ERROR_HANDLER.log(error, 'AIBot.sendMessage');
        }
    }

    async askQuestion(question) {
        const input = document.getElementById('ai-input');
        input.value = question;
        await this.sendMessage();
    }

    async getAIResponse(message) {
        try {
            // Update market context before generating response
            await this.updateMarketContext();
            
            // Generate response using Gemini API
            const response = await geminiAPI.generateContent(message, this.currentContext);
            
            // Add to conversation history
            this.conversationHistory.push({
                user: message,
                ai: response,
                timestamp: Date.now(),
                context: CONFIG_UTILS.deepClone(this.currentContext)
            });
            
            return response;
        } catch (error) {
            ERROR_HANDLER.log(error, 'AIBot.getAIResponse');
            return this.getFallbackResponse(message);
        }
    }

    getFallbackResponse(message) {
        const responses = {
            'bitcoin': '🟠 **Análise Bitcoin**\n\nCom base nos dados atuais, o Bitcoin apresenta movimentação dentro da normalidade. Recomendo:\n\n• Acompanhar níveis de $60,000 (suporte) e $70,000 (resistência)\n• Monitorar volume de negociação\n• Considerar DCA (Dollar Cost Averaging) para reduzir volatilidade',
            
            'ethereum': '🔷 **Análise Ethereum**\n\nO Ethereum está mostrando sinais interessantes:\n\n• Rede em crescimento constante\n• Staking gerando retornos\n• Atualizações técnicas positivas\n• Considere posição de longo prazo',
            
            'ações': '📊 **Mercado de Ações**\n\nO cenário atual apresenta:\n\n• **Bovespa**: Volatilidade moderada\n• **Setores defensivos**: Telecomunicações, Utilities\n• **Crescimento**: Tecnologia, Saúde\n• **Diversificação** é fundamental',
            
            'diversificar': '🎯 **Estratégia de Diversificação**\n\nPara uma carteira equilibrada:\n\n• **60%** Ações (30% BR + 30% Internacional)\n• **25%** Renda Fixa (CDB, Tesouro)\n• **10%** Criptomoedas (BTC, ETH)\n• **5%** Reserva de Emergência\n\nRebalanceie a cada 3 meses.',
            
            'risco': '⚠️ **Análise de Risco**\n\nSua carteira apresenta características:\n\n• **Nível**: Moderado\n• **Volatilidade**: Controlada\n• **Liquidez**: Adequada\n\n**Recomendações:**\n• Acompanhe correlações entre ativos\n• Mantenha reserva de emergência\n• Revise estratégia mensalmente',
            
            'mercado': '📈 **Visão de Mercado**\n\nCenário atual:\n\n• **Inflação**: Tendência de estabilização\n• **Juros**: Patamar elevado, mas com sinais de pico\n• **Dólar**: Volatilidade normal\n• **Commodities**: Movimento lateral\n\nFoque em ativos com fundamentos sólidos.',
            
            'comprar': '💰 **Decisão de Compra**\n\nAntes de qualquer compra, considere:\n\n• **Análise Fundamentalista**: Estude a empresa/ativo\n• **Análise Técnica**: Verifique pontos de entrada\n• **Gestão de Risco**: Nunca mais que 5% em um ativo\n• **Timing**: Mercado em alta ou baixa?\n\nDiversifique sempre!',
            
            'vender': '📉 **Estratégia de Venda**\n\nAvaliar critérios:\n\n• **Stop Loss**: Perdas acima de 10%?\n• **Take Profit**: Ganhos satisfatórios?\n• **Rebalanceamento**: Algum ativo muito concentrado?\n• **Fundamentos**: Mudaram negativamente?\n\nMantenha disciplina emocional.',
            
            'default': '🤖 **Assistente IA**\n\nEstou aqui para ajudar com:\n\n• Análises de mercado em tempo real\n• Estratégias de investimento\n• Gestão de risco\n• Diversificação de carteira\n• Recomendações personalizadas\n\nPergunta específica sobre algum ativo ou estratégia?'
        };
        
        // Find best matching response
        const lowerMessage = message.toLowerCase();
        let bestMatch = 'default';
        
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key) && key !== 'default') {
                bestMatch = key;
                break;
            }
        }
        
        return responses[bestMatch];
    }

    addMessage(message, sender) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Format message with markdown-like styling
        const formattedMessage = this.formatMessage(message);
        content.innerHTML = formattedMessage;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        });
    }

    formatMessage(message) {
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
            .replace(/\*(.*?)\*/g, '<em>$1</em>')             // *italic*
            .replace(/\n/g, '<br>')                           // line breaks
            .replace(/•\s/g, '• ')                           // bullet points
            .replace(/(🟠|🔷|📊|🎯|⚠️|📈|💰|📉|🤖)/g, '<span class="emoji">$1</span>'); // emoji styling
    }

    showTypingIndicator() {
        this.isTyping = true;
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add typing animation CSS
        const style = document.createElement('style');
        style.textContent = `
            .typing-animation {
                display: flex;
                gap: 4px;
                padding: 10px;
            }
            .typing-animation span {
                width: 8px;
                height: 8px;
                background: var(--primary-color);
                border-radius: 50%;
                animation: typingBounce 1.4s infinite ease-in-out both;
            }
            .typing-animation span:nth-child(1) { animation-delay: -0.32s; }
            .typing-animation span:nth-child(2) { animation-delay: -0.16s; }
            .typing-animation span:nth-child(3) { animation-delay: 0s; }
            @keyframes typingBounce {
                0%, 80%, 100% {
                    transform: scale(0);
                }
                40% {
                    transform: scale(1);
                }
            }
        `;
        
        if (!document.getElementById('typing-animation-style')) {
            style.id = 'typing-animation-style';
            document.head.appendChild(style);
        }
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async updateMarketContext() {
        try {
            const [cryptoData, stocksData] = await Promise.all([
                cryptoAPI.getCryptoPrices().catch(() => null),
                stocksAPI.getMultipleStocks(['PETR4.SA', 'VALE3.SA', 'ITUB4.SA']).catch(() => null)
            ]);
            
            this.currentContext = {
                timestamp: Date.now(),
                crypto: cryptoData,
                stocks: stocksData,
                portfolio: this.getUserPortfolio(),
                marketStatus: this.getMarketStatus()
            };
        } catch (error) {
            ERROR_HANDLER.log(error, 'AIBot.updateMarketContext');
        }
    }

    getUserPortfolio() {
        // Get user portfolio from localStorage or return mock data
        return CONFIG_UTILS.loadFromStorage('user_portfolio', {
            crypto: {
                bitcoin: { amount: 0.1, value: 33000 },
                ethereum: { amount: 2.5, value: 45000 }
            },
            stocks: {
                'PETR4.SA': { shares: 100, value: 3550 },
                'VALE3.SA': { shares: 50, value: 3260 }
            },
            totalValue: 114810
        });
    }

    getMarketStatus() {
        return {
            bovespaOpen: CONFIG_UTILS.isMarketOpen('BOVESPA'),
            nyseOpen: CONFIG_UTILS.isMarketOpen('NYSE'),
            cryptoMarket: 'always_open'
        };
    }

    saveConversation() {
        try {
            CONFIG_UTILS.saveToStorage('ai_conversation_history', this.conversationHistory);
        } catch (error) {
            ERROR_HANDLER.log(error, 'AIBot.saveConversation');
        }
    }

    loadConversationHistory() {
        try {
            this.conversationHistory = CONFIG_UTILS.loadFromStorage('ai_conversation_history', []);
            
            // Load recent messages to chat (last 5)
            const recentMessages = this.conversationHistory.slice(-5);
            recentMessages.forEach(conv => {
                this.addMessage(conv.user, 'user');
                this.addMessage(conv.ai, 'ai');
            });
        } catch (error) {
            ERROR_HANDLER.log(error, 'AIBot.loadConversationHistory');
        }
    }

    clearConversation() {
        this.conversationHistory = [];
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Olá! Sou seu assistente de investimentos com IA. Como posso ajudá-lo hoje?</p>
                    </div>
                </div>
            `;
        }
        CONFIG_UTILS.saveToStorage('ai_conversation_history', []);
    }

    // Market Analysis Methods
    async analyzeMarketTrends() {
        try {
            const analysis = {
                crypto: await this.analyzeCryptoTrends(),
                stocks: await this.analyzeStockTrends(),
                recommendations: this.generateRecommendations()
            };
            
            return analysis;
        } catch (error) {
            ERROR_HANDLER.log(error, 'AIBot.analyzeMarketTrends');
            return null;
        }
    }

    async analyzeCryptoTrends() {
        const cryptoData = await cryptoAPI.getCryptoPrices();
        const trends = {};
        
        for (const [coin, data] of Object.entries(cryptoData)) {
            trends[coin] = {
                price: data.brl,
                change24h: data.brl_24h_change,
                trend: data.brl_24h_change > 0 ? 'bullish' : 'bearish',
                strength: Math.abs(data.brl_24h_change) > 5 ? 'strong' : 'weak'
            };
        }
        
        return trends;
    }

    async analyzeStockTrends() {
        const stocksData = await stocksAPI.getMultipleStocks(APP_CONFIG.STOCKS.BRAZILIAN_STOCKS);
        const trends = {};
        
        stocksData.forEach(stock => {
            trends[stock.symbol] = {
                price: stock.price,
                changePercent: stock.changePercent,
                trend: stock.changePercent > 0 ? 'bullish' : 'bearish',
                volume: stock.volume
            };
        });
        
        return trends;
    }

    generateRecommendations() {
        const recommendations = [
            {
                type: 'diversification',
                message: 'Considere rebalancear sua carteira para manter diversificação adequada.',
                priority: 'medium'
            },
            {
                type: 'risk_management',
                message: 'Mantenha stop-loss em 10% para posições especulativas.',
                priority: 'high'
            },
            {
                type: 'opportunity',
                message: 'Setor de tecnologia apresenta oportunidades interessantes.',
                priority: 'low'
            }
        ];
        
        return recommendations;
    }

    // Performance tracking
    trackPerformance() {
        const metrics = {
            responsesGenerated: this.conversationHistory.length,
            averageResponseTime: this.calculateAverageResponseTime(),
            userSatisfaction: this.calculateUserSatisfaction(),
            lastUpdate: Date.now()
        };
        
        CONFIG_UTILS.saveToStorage('ai_bot_metrics', metrics);
        return metrics;
    }

    calculateAverageResponseTime() {
        // Mock calculation - in production, track actual response times
        return 2.5; // seconds
    }

    calculateUserSatisfaction() {
        // Mock calculation - in production, track user feedback
        return 0.85; // 85% satisfaction
    }
}

// Initialize AI Bot when DOM is loaded
let aiBot;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        aiBot = new AIBot();
    });
} else {
    aiBot = new AIBot();
}

// Export for global access
if (typeof window !== 'undefined') {
    window.AIBot = AIBot;
    window.aiBot = aiBot;
}

