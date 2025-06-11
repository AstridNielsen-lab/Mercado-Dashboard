@echo off
setlocal enabledelayedexpansion

echo ======================================
echo    Mercado Neural - Instalacao
echo ======================================
echo.
echo Este script ira:
echo 1. Verificar pre-requisitos
echo 2. Baixar Node.js (se necessario)
echo 3. Instalar dependencias
echo 4. Compilar a aplicacao
echo 5. Criar o instalador
echo.
pause

:: Criar diretorio temporario
set TEMP_DIR=%TEMP%\MercadoNeural
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

:: Verificar se Node.js esta instalado
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js nao encontrado. Baixando...
    
    :: Detectar arquitetura
    if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
        set NODE_URL=https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi
        set NODE_FILE=node-x64.msi
    ) else (
        set NODE_URL=https://nodejs.org/dist/v20.10.0/node-v20.10.0-x86.msi
        set NODE_FILE=node-x86.msi
    )
    
    echo Baixando Node.js...
    powershell -Command "Invoke-WebRequest -Uri '!NODE_URL!' -OutFile '%TEMP_DIR%\!NODE_FILE!'"
    if errorlevel 1 (
        echo [ERRO] Falha ao baixar Node.js!
        echo Por favor, baixe manualmente de: https://nodejs.org/
        pause
        exit /b 1
    )
    
    echo Instalando Node.js...
    msiexec /i "%TEMP_DIR%\!NODE_FILE!" /quiet /norestart
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar Node.js!
        echo Tente instalar manualmente: %TEMP_DIR%\!NODE_FILE!
        pause
        exit /b 1
    )
    
    echo Node.js instalado! Reiniciando script...
    timeout /t 3 /nobreak
    
    :: Atualizar PATH
    call refreshenv.cmd 2>nul
    set PATH=%PATH%;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs
) else (
    echo Node.js encontrado!
)

echo.
echo [2/5] Verificando NPM...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] NPM nao encontrado mesmo com Node.js instalado!
    echo Tente reiniciar o prompt de comando.
    pause
    exit /b 1
)

echo NPM encontrado!
echo.

echo [3/5] Instalando dependencias...
echo Isso pode levar alguns minutos...
npm install
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias!
    echo Verifique sua conexao com a internet.
    pause
    exit /b 1
)

echo.
echo [4/5] Instalando ferramentas de build...
npm install --save-dev electron-reload 2>nul

echo.
echo [5/5] Compilando aplicacao...
echo Criando build para Windows...
npm run build-win
if errorlevel 1 (
    echo [AVISO] Build principal falhou. Tentando metodo alternativo...
    npx electron-builder --win
    if errorlevel 1 (
        echo [ERRO] Falha ao compilar a aplicacao!
        echo.
        echo Tente executar manualmente:
        echo npm run build-win
        pause
        exit /b 1
    )
)

echo.
echo ======================================
echo     INSTALACAO CONCLUIDA!
echo ======================================
echo.
echo O instalador foi criado em: dist/
echo.
echo Arquivos gerados:
if exist dist\*.exe (
    for %%f in (dist\*.exe) do echo - %%~nxf
) else (
    echo Nenhum arquivo .exe encontrado.
    echo Verificando pasta dist/:
    if exist dist dir dist /b
)

echo.
echo Para executar a aplicacao:
echo 1. Va para a pasta 'dist'
echo 2. Execute o arquivo 'Mercado Neural Setup-*.exe'
echo 3. Siga as instrucoes do instalador
echo.
echo Para testar em modo desenvolvimento:
echo npm run dev
echo.
echo Pressione qualquer tecla para abrir a pasta dist...
pause >nul
if exist dist explorer dist

:: Limpeza
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%" 2>nul

exit /b 0

