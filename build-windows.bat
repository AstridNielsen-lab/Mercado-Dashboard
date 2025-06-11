@echo off
echo ======================================
echo  Mercado Neural - Build para Windows
echo ======================================
echo.

:: Verificar se Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js primeiro:
    echo https://nodejs.org/
    echo.
    echo Apos a instalacao, execute este script novamente.
    pause
    exit /b 1
)

:: Verificar se npm esta disponivel
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] NPM nao encontrado!
    echo Node.js pode estar instalado incorretamente.
    pause
    exit /b 1
)

echo [INFO] Node.js e NPM encontrados!
echo.

:: Instalar dependencias
echo [1/4] Instalando dependencias...
npm install
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias!
    pause
    exit /b 1
)

echo.
echo [2/4] Instalando dependencias de desenvolvimento...
npm install --save-dev electron-reload
if errorlevel 1 (
    echo [AVISO] Falha ao instalar electron-reload (opcional)
)

echo.
echo [3/4] Preparando build...
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [4/4] Compilando aplicacao para Windows...
npm run build-win
if errorlevel 1 (
    echo [ERRO] Falha ao compilar a aplicacao!
    echo.
    echo Tentando build alternativo...
    npx electron-builder --win
    if errorlevel 1 (
        echo [ERRO] Build alternativo tambem falhou!
        pause
        exit /b 1
    )
)

echo.
echo ======================================
echo  BUILD CONCLUIDO COM SUCESSO!
echo ======================================
echo.
echo O instalador foi criado em: dist/
echo.
echo Arquivos gerados:
dir dist\*.exe /b 2>nul
if errorlevel 1 (
    echo Nenhum executavel encontrado em dist/
    echo Verificando outros formatos...
    dir dist\* /b
)

echo.
echo Para testar a aplicacao em modo desenvolvimento:
echo npm run dev
echo.
echo Para executar a aplicacao compilada:
echo Procure por "Mercado Neural Setup" na pasta dist/
echo.
pause

