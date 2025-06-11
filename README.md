# Dashboard Financeira Inteligente - Mercado Neural

📊 Uma dashboard completa para gestão de investimentos em criptomoedas, ações e análise de mercado com IA integrada.

## 🎆 Funcionalidades

### 💰 Gestão Financeira
- **Saldo Geral**: Visão consolidada de todos os ativos
- **Carteiras Múltiplas**: PIX, PayPal, Bitcoin, Ethereum, Litecoin
- **Endereços de Carteira**: Configurados conforme especificação
  - PIX/PayPal: radiotatuapefm@gmail.com
  - Bitcoin: bc1qmjf00jqttk2kgemxtxh0hv4xp8fqztnn23cuc2
  - Ethereum: 0x7481B4591e7f0DFAD23b884E78C46F0c207a3E35
  - Litecoin: ltc1qxytts52mykr2u83x6ghwllmu7d524ltt702mcc

### 🪙 Criptomoedas
- **Cotações em Tempo Real**: Integração com CoinGecko API
- **Gráficos Interativos**: Variações de 24h, 7d, 30d
- **Compra/Venda**: Sistema simulado de transações
- **Histórico**: Registro completo de operações
- **Análise**: Cálculo automático de lucros/perdas

### 📈 Ações (Bolsa de Valores)
- **Mercados**: Bovespa (ações brasileiras) e NYSE (ações americanas)
- **Dados em Tempo Real**: Preços, variações, volume
- **Portfólio**: Gerenciamento de posições em ações
- **Lista de Acompanhamento**: Adicione/remova ações personalizadas
- **Análise Fundamentalista**: Métricas de performance

### 🤖 IA Bot (Google Gemini)
- **Assistente Inteligente**: Powered by Google Gemini API
- **Análise Preditiva**: Recomendações baseadas em dados
- **Perguntas Rápidas**: Templates pré-definidos
- **Contexto de Mercado**: Respostas com base em dados reais
- **Histórico de Conversa**: Salvo localmente

### 📉 Relatórios e Análises
- **Gráficos Avançados**: Chart.js integrado
- **Performance Mensal**: Acompanhamento de resultados
- **Exportação**: PDF e CSV
- **Metas Financeiras**: Definição e acompanhamento

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 (Neumorphism), JavaScript ES6+
- **Gráficos**: Chart.js
- **APIs**: 
  - Google Gemini (IA)
  - CoinGecko (Criptomoedas)
  - Yahoo Finance (Ações)
  - MercadoPago (Pagamentos)
- **Armazenamento**: LocalStorage com criptografia
- **Design**: Responsivo, Dark/Light Mode

## 🚀 Como Usar

### 1. Instalação
```bash
# Clone ou baixe os arquivos
# Não requer instalação de dependências
# Funciona diretamente no navegador
```

### 2. Configuração das APIs

As chaves de API estão pré-configuradas:

```javascript
// MercadoPago
PUBLIC_KEY: 'APP_USR-89626122-2e4b-4cb0-9817-c55ef42ed140'
ACCESS_TOKEN: 'APP_USR-3581564190523037-031023-d3a76685b122d5702bee3178000269c3-29008060'

// Google Gemini
API_KEY: 'AIzaSyC4vPY7_qfh2LPOYSq1IhuRFTlO_ypVfOE'
```

### 3. Execução
1. Abra o arquivo `index.html` em um navegador moderno
2. A dashboard carregará automaticamente
3. Todas as funcionalidades estarão disponíveis imediatamente

## 📚 Estrutura do Projeto

```
Mercado Neural/
│
├── index.html              # Página principal
│
├── assets/
│   ├── css/
│   │   ├── styles.css       # Estilos principais
│   │   └── neumorphism.css  # Tema Neumorphism
│   │
│   ├── js/
│   │   ├── config.js        # Configurações
│   │   ├── api.js           # Integrações API
│   │   ├── crypto.js        # Sistema de criptomoedas
│   │   ├── stocks.js        # Sistema de ações
│   │   ├── ai-bot.js        # IA Bot
│   │   ├── charts.js        # Gerenciador de gráficos
│   │   └── main.js          # Aplicação principal
│   │
│   └── images/              # Imagens e ícones
│
├── components/              # Componentes reutilizáveis
├── config/                  # Arquivos de configuração
└── README.md               # Documentação
```

## 🎮 Funcionalidades Interativas

### Navegação
- **Sidebar Responsiva**: Navegação entre seções
- **Tema Dinâmico**: Alterne entre claro/escuro
- **Atalhos de Teclado**: Ctrl+K para IA, Esc para fechar modais

### Criptomoedas
1. **Visualizar Carteiras**: Veça saldos e valores atuais
2. **Comprar/Vender**: Clique nos botões para simular transações
3. **Gráficos**: Altere períodos (24h, 7d, 30d)
4. **Endereços**: Visualize endereços das carteiras

### Ações
1. **Lista de Ações**: Veja preços em tempo real
2. **Adicionar Ações**: Use o botão "+" para adicionar novos tíckers
3. **Comprar/Vender**: Gerencie seu portfólio
4. **Análise**: Veja performance e retornos

### IA Bot
1. **Perguntas Rápidas**: Clique nos botões pré-definidos
2. **Perguntas Personalizadas**: Digite suas dúvidas
3. **Análise de Mercado**: Solicite recomendações
4. **Histórico**: Veja conversações anteriores

## 🔧 Personalização

### Configurar APIs Próprias
Edite o arquivo `assets/js/config.js`:

```javascript
APIS: {
    GEMINI: {
        API_KEY: 'SUA_CHAVE_AQUI'
    },
    MERCADOPAGO: {
        ACCESS_TOKEN: 'SEU_TOKEN_AQUI'
    }
}
```

### Adicionar Novas Criptomoedas
```javascript
CRYPTO: {
    SUPPORTED_COINS: ['bitcoin', 'ethereum', 'litecoin', 'nova-moeda']
}
```

### Personalizar Ações
```javascript
STOCKS: {
    BRAZILIAN_STOCKS: ['PETR4.SA', 'NOVA-ACAO.SA'],
    US_STOCKS: ['AAPL', 'NOVA-STOCK']
}
```

## 🔒 Segurança

- **Armazenamento Local**: Dados salvos com criptografia base64
- **Chaves API**: Configuradas de forma segura
- **Simulação**: Transações são simuladas (não reais)
- **Validação**: Inputs validados contra XSS

## 📱 Responsividade

- **Desktop**: Experiência completa
- **Tablet**: Layout adaptado
- **Mobile**: Interface otimizada
- **PWA Ready**: Pode ser instalado como app

## 📦 Exportação de Dados

### CSV
- Portfólio completo
- Histórico de transações
- Relatórios personalizados

### PDF (Em Desenvolvimento)
- Relatórios profissionais
- Gráficos incluídos
- Análises detalhadas

## 🤖 IA - Exemplos de Uso

### Perguntas Sugeridas:
1. "Quais ações têm maior potencial hoje?"
2. "Devo comprar Bitcoin agora?"
3. "Como diversificar minha carteira?"
4. "Análise de risco da minha carteira"

### Recursos da IA:
- Análise de mercado em tempo real
- Recomendações personalizadas
- Explicações didáticas
- Alertas de risco

## 🛠️ Manutenção

### Logs de Erro
Acesse via console do navegador:
```javascript
console.log(CONFIG_UTILS.loadFromStorage('error_logs'));
```

### Métricas de Performance
```javascript
console.log(dashboard.getSystemMetrics());
```

### Limpar Dados
```javascript
localStorage.clear(); // Remove todos os dados salvos
```

## 📜 Atualizações Futuras

- [ ] Integração com exchanges reais
- [ ] Notificações push
- [ ] App mobile nativo
- [ ] Mais indicadores técnicos
- [ ] Social trading
- [ ] Portfolio sharing

## 🎆 Suporte

Para dúvidas ou sugestões:
1. Verifique o console do navegador para erros
2. Consulte a documentação das APIs utilizadas
3. Teste em modo de desenvolvedor (F12)

## 📝 Licença

Projeto desenvolvido para fins educacionais e demonstração.
Use por sua conta e risco em ambiente de produção.

---

**Desenvolvido com ❤️ para o mercado financeiro brasileiro**

*Mercado Neural - Onde a IA encontra os investimentos* 🤖💰

