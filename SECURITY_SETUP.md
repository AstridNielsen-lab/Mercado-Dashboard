# Guia de Configuração Segura - Mercado Neural

## 🔒 Configuração Segura de APIs

Este guia detalha como configurar suas chaves de API de forma segura para o projeto Mercado Neural.

## ⚠️ AVISOS IMPORTANTES

- **NUNCA** commite chaves de API reais em repositórios públicos
- **SEMPRE** use variáveis de ambiente em produção
- **ROTACIONE** suas chaves regularmente
- **MONITORE** o uso das suas APIs

## 🛠️ Configuração Passo a Passo

### 1. Google Gemini AI API

#### Obtenção da Chave:
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada (formato: `AIza...`)

#### Configuração:
```javascript
// Em assets/js/config.js
GEMINI: {
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
    API_KEY: 'SUA_CHAVE_GEMINI_AQUI'
}
```

#### Limites e Custos:
- **Gratuito**: 60 requisições por minuto
- **Pago**: Consulte [preços do Gemini](https://ai.google.dev/pricing)

### 2. MercadoPago API (Opcional)

#### Obtenção das Chaves:
1. Acesse [MercadoPago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma aplicação
3. Obtenha as credenciais:
   - **Public Key**: Para operações do frontend
   - **Access Token**: Para operações do backend
   - **Client ID** e **Client Secret**: Para OAuth

#### Configuração:
```javascript
// Em assets/js/config.js
MERCADOPAGO: {
    PUBLIC_KEY: 'APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    ACCESS_TOKEN: 'APP_USR-xxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx',
    CLIENT_ID: 'xxxxxxxxxx',
    CLIENT_SECRET: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
}
```

#### Ambiente de Teste vs Produção:
- **Teste**: Use as credenciais de test
- **Produção**: Use as credenciais de produção

### 3. Alpha Vantage API (Opcional)

#### Obtenção da Chave:
1. Acesse [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Registre-se gratuitamente
3. Copie sua chave de API

#### Configuração:
```javascript
// Em assets/js/config.js
ALPHA_VANTAGE: {
    BASE_URL: 'https://www.alphavantage.co/query',
    API_KEY: 'SUA_CHAVE_ALPHA_VANTAGE_AQUI'
}
```

#### Limites:
- **Gratuito**: 5 requisições por minuto, 500 por dia
- **Premium**: Limites maiores disponíveis

## 🛡️ Boas Práticas de Segurança

### 1. Validação de Chaves

```javascript
// Função para validar formato das chaves
function validateApiKeys() {
    const geminiKey = APP_CONFIG.APIS.GEMINI.API_KEY;
    const mpPublicKey = APP_CONFIG.APIS.MERCADOPAGO.PUBLIC_KEY;
    
    // Validar formato Gemini (AIza...)
    if (!geminiKey.startsWith('AIza') || geminiKey.length !== 39) {
        console.warn('Chave Gemini com formato inválido');
        return false;
    }
    
    // Validar formato MercadoPago (APP_USR-...)
    if (!mpPublicKey.startsWith('APP_USR-')) {
        console.warn('Chave MercadoPago com formato inválido');
        return false;
    }
    
    return true;
}
```

### 2. Rate Limiting

```javascript
// Sistema de rate limiting
class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
    }
    
    canMakeRequest() {
        const now = Date.now();
        // Remove requisições antigas
        this.requests = this.requests.filter(
            time => now - time < this.timeWindow
        );
        
        return this.requests.length < this.maxRequests;
    }
    
    addRequest() {
        this.requests.push(Date.now());
    }
}

// Uso
const geminiLimiter = new RateLimiter(60, 60000); // 60 req/min
```

### 3. Tratamento de Erros

```javascript
// Função para fazer requisições seguras
async function safeApiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            timeout: 30000 // 30s timeout
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Call failed:', error);
        throw error;
    }
}
```

## 🚀 Configuração para Produção

### 1. Usando Variáveis de Ambiente

```javascript
// config.production.js
const APP_CONFIG = {
    APIS: {
        GEMINI: {
            API_KEY: process.env.GEMINI_API_KEY || 'fallback-key'
        },
        MERCADOPAGO: {
            PUBLIC_KEY: process.env.MP_PUBLIC_KEY || 'fallback-key',
            ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN || 'fallback-token'
        }
    }
};
```

### 2. Servidor Proxy (Recomendado)

```javascript
// Exemplo de proxy para ocultar chaves
// server.js (Node.js)
const express = require('express');
const app = express();

app.post('/api/gemini', async (req, res) => {
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/...', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'API Error' });
    }
});
```

## 🔍 Monitoramento e Logs

### 1. Log de Requisições

```javascript
// Sistema de logging
const API_LOGGER = {
    log: (apiName, endpoint, status, duration) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            api: apiName,
            endpoint,
            status,
            duration,
            userAgent: navigator.userAgent
        };
        
        // Salvar em localStorage ou enviar para servidor
        console.log('[API Log]', logEntry);
    }
};
```

### 2. Alertas de Uso

```javascript
// Monitor de uso de API
class ApiUsageMonitor {
    constructor() {
        this.usage = CONFIG_UTILS.loadFromStorage('api_usage', {});
    }
    
    trackUsage(apiName) {
        const today = new Date().toDateString();
        if (!this.usage[today]) {
            this.usage[today] = {};
        }
        
        this.usage[today][apiName] = (this.usage[today][apiName] || 0) + 1;
        CONFIG_UTILS.saveToStorage('api_usage', this.usage);
        
        // Alertar se próximo do limite
        this.checkLimits(apiName, this.usage[today][apiName]);
    }
    
    checkLimits(apiName, currentUsage) {
        const limits = {
            'GEMINI': 60, // por minuto
            'ALPHA_VANTAGE': 500 // por dia
        };
        
        const limit = limits[apiName];
        if (limit && currentUsage > limit * 0.8) {
            console.warn(`Aproximando do limite da API ${apiName}: ${currentUsage}/${limit}`);
        }
    }
}
```

## 🆘 Resolução de Problemas

### Problemas Comuns:

1. **"API Key Invalid"**
   - Verifique o formato da chave
   - Confirme que a chave está ativa
   - Teste em ambiente de desenvolvimento

2. **"Rate Limit Exceeded"**
   - Implemente delays entre requisições
   - Use cache para respostas
   - Considere upgrade do plano

3. **"CORS Error"**
   - Configure proxy server
   - Use credenciais adequadas para ambiente

4. **"Network Error"**
   - Verifique conectividade
   - Implemente retry logic
   - Configure timeouts adequados

### Debug Mode:

```javascript
// Ativar modo debug
APP_CONFIG.DEBUG = true;

// Ver logs detalhados
console.log('API Configs:', APP_CONFIG.APIS);
console.log('Usage Stats:', CONFIG_UTILS.loadFromStorage('api_usage'));
console.log('Error Logs:', CONFIG_UTILS.loadFromStorage('error_logs'));
```

## 📞 Suporte

Para problemas específicos:

1. **Google Gemini**: [Documentação oficial](https://ai.google.dev/docs)
2. **MercadoPago**: [Centro de ajuda](https://www.mercadopago.com.br/developers/pt/support)
3. **Alpha Vantage**: [FAQ](https://www.alphavantage.co/support/)

---

**⚠️ Lembre-se: A segurança é responsabilidade de todos. Sempre valide suas configurações antes de ir para produção!**

