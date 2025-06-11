@echo off
echo ========================================
echo  Mercado Neural - Teste do Instalador
echo ========================================
echo.
echo Verificando o instalador gerado...
echo.

if exist "dist\Mercado-Neural-Setup-v1.0.0.exe" (
    echo [OK] Instalador encontrado!
    echo.
    echo Arquivo: dist\Mercado-Neural-Setup-v1.0.0.exe
    for %%f in ("dist\Mercado-Neural-Setup-v1.0.0.exe") do echo Tamanho: %%~zf bytes
    echo.
    echo OPCOES:
    echo [1] Executar instalador
    echo [2] Abrir pasta de destino
    echo [3] Sair
    echo.
    set /p choice="Escolha uma opcao (1-3): "
    
    if "%choice%"=="1" (
        echo.
        echo Executando instalador...
        start "" "dist\Mercado-Neural-Setup-v1.0.0.exe"
        echo Instalador iniciado!
    ) else if "%choice%"=="2" (
        echo.
        echo Abrindo pasta...
        explorer "dist"
    )
    
) else (
    echo [ERRO] Instalador nao encontrado!
    echo.
    echo Certifique-se de que o arquivo foi gerado corretamente:
    echo dist\Mercado-Neural-Setup-v1.0.0.exe
)

echo.
echo Pressione qualquer tecla para continuar...
pause >nul

