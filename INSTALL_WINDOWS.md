# 🚀 Instalação do Mercado Neural para Windows

Guia completo para instalar e compilar a versão desktop do Mercado Neural.

## 📋 Pré-requisitos

### Opção 1: Instalação Automática (Recomendada)
- Windows 7 ou superior
- Conexão com a internet
- Permissões de administrador

### Opção 2: Instalação Manual
- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- NPM (incluído com Node.js)
- Git (opcional)

## 🎯 Instalação Rápida (Automática)

### Passo 1: Baixar o Projeto
1. Baixe o projeto do GitHub ou clone:
   ```bash
   git clone https://github.com/AstridNielsen-lab/Mercado-Dashboard-Neural.git
   cd Mercado-Dashboard-Neural
   ```

### Passo 2: Executar Instalação Automática
1. **Execute como Administrador** o arquivo `install-windows.bat`
2. Siga as instruções na tela
3. O script irá:
   - Verificar/instalar Node.js automaticamente
   - Instalar todas as dependências
   - Compilar a aplicação
   - Criar o instalador

### Passo 3: Instalar a Aplicação
1. Após a compilação, vá para a pasta `dist/`
2. Execute `Mercado Neural Setup-1.0.0.exe`
3. Siga o assistente de instalação
4. A aplicação será instalada e criará atalhos no Desktop e Menu Iniciar

## 🛠️ Instalação Manual

### Passo 1: Instalar Node.js
1. Baixe e instale o Node.js de [nodejs.org](https://nodejs.org/)
2. Verifique a instalação:
   ```cmd
   node --version
   npm --version
   ```

### Passo 2: Instalar Dependências
```cmd
npm install
```

### Passo 3: Compilar para Windows
```cmd
npm run build-win
```

### Passo 4: Instalar a Aplicação
1. Navegue até a pasta `dist/`
2. Execute o arquivo `.exe` gerado

## 🏃‍♂️ Modo Desenvolvimento

Para testar a aplicação em modo desenvolvimento:

```cmd
# Instalar dependências (se não instaladas)
npm install

# Executar em modo desenvolvimento
npm run dev
```

## 📁 Estrutura de Arquivos

```
Mercado Neural/
├── electron/
│   ├── main.js              # Processo principal do Electron
│   ├── splash.html          # Tela de inicialização
│   └── installer.nsh        # Script do instalador NSIS
├── assets/
│   ├── js/
│   │   └── config.js        # Configurações (com suas chaves)
│   ├── css/
│   └── images/
├── dist/                    # Arquivos compilados (criado após build)
├── package.json             # Dependências e scripts
├── index.html              # Interface principal
├── install-windows.bat     # Instalador automático
└── build-windows.bat       # Script de build
```

## ⚙️ Configuração

### Chaves de API Configuradas
O projeto já está configurado com suas chaves de API:

- **Google Gemini AI**: ✅ Configurado
- **MercadoPago**: ✅ Configurado
- **Carteiras Crypto**: ✅ Configuradas

### Personalizações Disponíveis

Edite o arquivo `assets/js/config.js` para:
- Alterar configurações de API
- Modificar intervalos de atualização
- Personalizar interface
- Configurar notificações

## 🎮 Funcionalidades da Versão Desktop

### Menu da Aplicação
- **Arquivo**: Exportar/Importar dados, Configurações
- **Visualizar**: Zoom, Tela cheia, Dev Tools
- **Dashboard**: Atualizar dados, IA Assistant, Modo escuro
- **Ajuda**: Sobre, Documentação, Verificar atualizações

### Atalhos de Teclado
- `Ctrl+E`: Exportar dados
- `Ctrl+I`: Importar dados
- `Ctrl+K`: Abrir IA Assistant
- `F5`: Atualizar dados
- `F11`: Tela cheia
- `F12`: Ferramentas do desenvolvedor

### Recursos Exclusivos Desktop
- Notificações do sistema
- Atualizações automáticas
- Armazenamento local seguro
- Menu nativo do Windows
- Integração com sistema de arquivos

## 🔧 Solução de Problemas

### Erro: "Node.js não encontrado"
**Solução**: 
1. Instale o Node.js de [nodejs.org](https://nodejs.org/)
2. Reinicie o prompt de comando
3. Execute o script novamente

### Erro: "Falha ao instalar dependências"
**Solução**:
1. Verifique sua conexão com a internet
2. Execute como administrador
3. Limpe o cache do NPM:
   ```cmd
   npm cache clean --force
   npm install
   ```

### Erro: "Falha ao compilar"
**Solução**:
1. Verifique se todas as dependências foram instaladas
2. Tente o build alternativo:
   ```cmd
   npx electron-builder --win
   ```

### Aplicação não inicia
**Solução**:
1. Verifique se o Windows Defender não está bloqueando
2. Execute como administrador
3. Verifique os logs no console (F12)

### Erro de APIs
**Solução**:
1. Verifique se as chaves de API estão corretas em `config.js`
2. Teste a conectividade com a internet
3. Verifique se as APIs não atingiram o limite de uso

## 📱 Requisitos do Sistema

### Mínimos
- Windows 7 SP1 (64-bit)
- 4 GB RAM
- 500 MB espaço livre
- Conexão com internet

### Recomendados
- Windows 10/11 (64-bit)
- 8 GB RAM
- 1 GB espaço livre
- Conexão estável com internet

## 🔄 Atualizações

A aplicação desktop inclui sistema de atualização automática:
- Verifica atualizações no GitHub
- Baixa e instala automaticamente
- Notifica quando uma nova versão está disponível

## 🗂️ Backup e Dados

### Localização dos Dados
- **Configurações**: `%APPDATA%\Mercado Neural\`
- **Portfólio**: Armazenado localmente com criptografia
- **Cache**: `%LOCALAPPDATA%\Mercado Neural\`

### Backup Manual
1. Vá para `%APPDATA%\Mercado Neural\`
2. Copie todos os arquivos para um local seguro
3. Para restaurar, cole os arquivos de volta

### Exportar Dados
1. Use `Ctrl+E` ou Menu > Arquivo > Exportar
2. Escolha o formato (JSON/CSV)
3. Salve em local seguro

## 📞 Suporte

### Logs de Debug
Para obter logs detalhados:
1. Abra a aplicação
2. Pressione `F12` para abrir Dev Tools
3. Vá para a aba "Console"
4. Copie os logs para reportar problemas

### Reportar Problemas
1. Acesse: [GitHub Issues](https://github.com/AstridNielsen-lab/Mercado-Dashboard-Neural/issues)
2. Inclua:
   - Versão do Windows
   - Versão da aplicação
   - Logs de erro
   - Passos para reproduzir

---

## 🎉 Conclusão

Após a instalação, você terá:
- ✅ Aplicação desktop completa
- ✅ Todas as funcionalidades web + recursos desktop
- ✅ Atalho no Desktop e Menu Iniciar
- ✅ Atualizações automáticas
- ✅ Dados seguros e persistentes

**Aproveite sua Dashboard Financeira Inteligente! 🚀💰**

