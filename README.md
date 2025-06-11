# 🧠 Dashboard Financeira Inteligente - Mercado Neural

🚀 **Nova Versão Desktop Disponível!** - Instalador completo para Windows com interface gráfica

📊 Uma dashboard completa para gestão de investimentos em criptomoedas, ações e análise de mercado com IA integrada.

## 📦 Downloads

### 🎯 Versão Desktop (Recomendada)
- **🖥️ Instalador Completo**: `Mercado-Neural-Setup-v1.0.0.exe` (164 MB)
  - Interface gráfica de instalação em português
  - Atalhos automáticos no Menu Iniciar e Área de Trabalho
  - Desinstalador incluído
  - Registro no Windows (Adicionar/Remover Programas)
  
- **📁 Versão Portable**: `Mercado-Neural-v1.0.0-Windows-Portable.zip` (269 MB)
  - Não requer instalação
  - Execute diretamente de qualquer pasta
  - Ideal para testes ou uso temporário

### 🌐 Versão Web
- **Demo Online**: [splash.html](./splash.html) - Acesso instantâneo via navegador
- **Aplicação Principal**: [index.html](./index.html) - Dashboard completo

## 🎆 Funcionalidades

### 💰 Gestão Financeira
- **Saldo Geral**: Visão consolidada de todos os ativos
- **Carteiras Múltiplas**: PIX, PayPal, Bitcoin, Ethereum, Litecoin
- **Endereços de Carteira**: Configuráveis através do arquivo de configuração
- **Suporte Multi-moeda**: BRL, USD e principais criptomoedas

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
- **Desktop**: Electron.js (Versão instalável para Windows)
- **Gráficos**: Chart.js
- **APIs**: 
  - Google Gemini (IA)
  - CoinGecko (Criptomoedas)
  - Yahoo Finance (Ações)
  - MercadoPago (Pagamentos)
- **Armazenamento**: LocalStorage com criptografia + Electron Store
- **Design**: Responsivo, Dark/Light Mode
- **Instalador**: NSIS (Windows)

## 🚀 Como Usar

### Opção 1: Versão Web (Navegador)
```bash
# Clone ou baixe os arquivos
# Não requer instalação de dependências
# Funciona diretamente no navegador
```

### Opção 2: Versão Desktop (Windows) ⭐ NOVO!
```bash
# Instalação automática (recomendada)
1. Execute install-windows.bat como Administrador
2. Siga as instruções na tela
3. A aplicação será compilada e instalada automaticamente
```

**📖 [Guia Completo de Instalação Windows](INSTALL_WINDOWS.md)**

### 2. Configuração das APIs

**⚠️ IMPORTANTE:** Para usar o projeto, você precisa configurar suas próprias chaves de API.

#### 2.1. Obtenha as chaves necessárias:

- **Google Gemini API**: 
  - Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Crie uma nova chave de API
  - Copie a chave gerada

- **MercadoPago** (opcional):
  - Acesse [MercadoPago Developers](https://www.mercadopago.com.br/developers)
  - Crie uma aplicação
  - Obtenha o PUBLIC_KEY e ACCESS_TOKEN

#### 2.2. Configure as chaves:

Edite o arquivo `assets/js/config.js` e substitua os valores nas seções correspondentes:

```javascript
APIS: {
    MERCADOPAGO: {
        PUBLIC_KEY: 'SUA_CHAVE_PUBLICA_AQUI',
        ACCESS_TOKEN: 'SEU_ACCESS_TOKEN_AQUI'
    },
    GEMINI: {
        API_KEY: 'SUA_CHAVE_GEMINI_AQUI'
    }
}
```

**🔒 Nunca exponha suas chaves de API em repositórios públicos!**

### 3. Execução

#### Versão Web:
1. Abra o arquivo `index.html` em um navegador moderno
2. A dashboard carregará automaticamente
3. Todas as funcionalidades estarão disponíveis imediatamente

#### Versão Desktop:
1. Execute o instalador criado na pasta `dist/`
2. Siga o assistente de instalação
3. Use o atalho criado no Desktop ou Menu Iniciar
4. Aproveite recursos exclusivos desktop!

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

### Configuração de APIs

Todas as configurações de API estão centralizadas no arquivo `assets/js/config.js`. 

**Estrutura de configuração:**

```javascript
APIS: {
    GEMINI: {
        API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
        API_KEY: 'SUA_CHAVE_GEMINI_AQUI'
    },
    MERCADOPAGO: {
        PUBLIC_KEY: 'SUA_CHAVE_PUBLICA_AQUI',
        ACCESS_TOKEN: 'SEU_ACCESS_TOKEN_AQUI'
    },
    COINGECKO: {
        BASE_URL: 'https://api.coingecko.com/api/v3',
        API_KEY: null // Free tier disponível
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

### Boas Práticas Implementadas

- **Armazenamento Local**: Dados salvos com criptografia base64
- **Validação de API**: Chaves validadas com regex patterns
- **Simulação Segura**: Transações são simuladas (não reais)
- **Validação de Input**: Proteção contra XSS
- **Rate Limiting**: Controle de frequência de requisições

### ⚠️ Importantes Considerações de Segurança

1. **Nunca exponha chaves de API em código público**
2. **Use HTTPS em produção**
3. **Implemente autenticação adequada para produção**
4. **Configure CORS adequadamente**
5. **Use variáveis de ambiente em produção**

### Configuração para Produção

Para uso em produção, considere:

```javascript
// Exemplo de configuração segura
const API_CONFIG = {
    GEMINI: {
        API_KEY: process.env.GEMINI_API_KEY || 'fallback-for-dev'
    },
    MERCADOPAGO: {
        ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN || 'fallback-for-dev'
    }
};
```

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

## 📦 Downloads

### Versão Web
- Abra `index.html` diretamente no navegador
- Sem necessidade de instalação

### Versão Desktop (Windows)
- **Automática**: Execute `install-windows.bat`
- **Manual**: Compile com `npm run build-win`
- **Recursos extras**: Menu nativo, atalhos, notificações

## 📜 Atualizações Futuras

- [x] ✅ Versão desktop para Windows
- [ ] Integração com exchanges reais
- [ ] Notificações push desktop
- [ ] App mobile nativo
- [ ] Versão para macOS
- [ ] Versão para Linux
- [ ] Mais indicadores técnicos
- [ ] Social trading
- [ ] Portfolio sharing
- [ ] Auto-updates via GitHub

## 🎆 Suporte

### Versão Web
1. Verifique o console do navegador para erros
2. Consulte a documentação das APIs utilizadas
3. Teste em modo de desenvolvedor (F12)

### Versão Desktop
1. Use F12 para abrir as ferramentas de desenvolvedor
2. Verifique logs em %APPDATA%\Mercado Neural\
3. Consulte o [Guia de Instalação](INSTALL_WINDOWS.md) para problemas específicos

## 📝 Licença

Projeto desenvolvido para fins educacionais e demonstração.
Use por sua conta e risco em ambiente de produção.

---

**Desenvolvido com ❤️ para o mercado financeiro brasileiro**

*Mercado Neural - Onde a IA encontra os investimentos* 🤖💰

