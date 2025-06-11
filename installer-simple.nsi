; Mercado Neural - Instalador NSIS Simplificado
; Desenvolvido por Mercado Neural Team
; Versão 1.0.0

!define APPNAME "Mercado Neural"
!define COMPANYNAME "Mercado Neural Team"
!define DESCRIPTION "Dashboard Financeira Inteligente com IA"
!define VERSIONMAJOR 1
!define VERSIONMINOR 0
!define VERSIONBUILD 0
!define HELPURL "https://github.com/AstridNielsen-lab/Mercado-Dashboard-Neural"
!define UPDATEURL "https://github.com/AstridNielsen-lab/Mercado-Dashboard-Neural/releases"
!define ABOUTURL "https://github.com/AstridNielsen-lab/Mercado-Dashboard-Neural"
!define INSTALLSIZE 300000 ; Tamanho estimado em KB

; Configurações do instalador
RequestExecutionLevel admin
InstallDir "$PROGRAMFILES64\${APPNAME}"
LicenseData "LICENSE.txt"
Name "${APPNAME}"
OutFile "dist\Mercado-Neural-Setup-v${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}.exe"

; Configurações da interface
!include MUI2.nsh

; Páginas do instalador
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Páginas do desinstalador
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Idiomas
!insertmacro MUI_LANGUAGE "PortugueseBR"

; Informações da versão
VIProductVersion "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}.0"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "ProductName" "${APPNAME}"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "CompanyName" "${COMPANYNAME}"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "LegalCopyright" "© 2024 ${COMPANYNAME}"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "FileDescription" "${DESCRIPTION}"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "FileVersion" "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}.0"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "ProductVersion" "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}.0"
VIAddVersionKey /LANG=${LANG_PORTUGUESEBR} "InternalName" "mercado-neural"

; Função de inicialização
Function .onInit
    ; Verificar se já está instalado
    ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString"
    StrCmp $R0 "" done
    
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
    "${APPNAME} já está instalado. $\n$\nClique 'OK' para remover a versão anterior ou 'Cancelar' para cancelar a instalação." \
    IDOK uninst
    Abort
    
    uninst:
        ClearErrors
        ExecWait '$R0 _?=$INSTDIR'
        
        IfErrors no_remove_uninstaller done
        no_remove_uninstaller:
    
    done:
FunctionEnd

; Seção principal - Arquivos do programa
Section "Mercado Neural (obrigatório)" SecMain
    SectionIn RO
    
    ; Definir diretório de saída
    SetOutPath $INSTDIR
    
    ; Arquivos principais
    File "dist\mercado-neural-portable\Mercado-Neural.exe"
    File "dist\mercado-neural-portable\*.dll"
    File "dist\mercado-neural-portable\*.pak"
    File "dist\mercado-neural-portable\*.bin"
    File "dist\mercado-neural-portable\*.dat"
    File "dist\mercado-neural-portable\*.json"
    File "dist\mercado-neural-portable\*.html"
    File "dist\mercado-neural-portable\version"
    File /nonfatal "dist\mercado-neural-portable\LICENSE"
    
    ; Pastas
    File /r "dist\mercado-neural-portable\locales"
    File /r "dist\mercado-neural-portable\resources"
    File /r "dist\mercado-neural-portable\node_modules"
    File /r "dist\mercado-neural-portable\assets"
    File /r "dist\mercado-neural-portable\electron"
    File /nonfatal /r "dist\mercado-neural-portable\components"
    File /nonfatal /r "dist\mercado-neural-portable\config"
    
    ; Criar atalho no menu iniciar
    CreateDirectory "$SMPROGRAMS\${APPNAME}"
    CreateShortCut "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk" "$INSTDIR\Mercado-Neural.exe"
    CreateShortCut "$SMPROGRAMS\${APPNAME}\Desinstalar.lnk" "$INSTDIR\uninstall.exe"
    
    ; Registrar no sistema
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayName" "${APPNAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "QuietUninstallString" "$INSTDIR\uninstall.exe /S"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "InstallLocation" "$INSTDIR"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "Publisher" "${COMPANYNAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "HelpLink" "${HELPURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "URLUpdateInfo" "${UPDATEURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "URLInfoAbout" "${ABOUTURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayVersion" "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "VersionMajor" ${VERSIONMAJOR}
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "VersionMinor" ${VERSIONMINOR}
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoRepair" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "EstimatedSize" ${INSTALLSIZE}
    
    ; Criar desinstalador
    WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

; Seção opcional - Atalho na área de trabalho
Section "Atalho na Área de Trabalho" SecDesktop
    CreateShortCut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\Mercado-Neural.exe"
SectionEnd

; Seção opcional - Executar após instalação
Section "Executar ${APPNAME}" SecRun
    Exec '"$INSTDIR\Mercado-Neural.exe"'
SectionEnd

; Descrições das seções
LangString DESC_SecMain ${LANG_PORTUGUESEBR} "Arquivos principais do ${APPNAME}."
LangString DESC_SecDesktop ${LANG_PORTUGUESEBR} "Criar atalho na área de trabalho."
LangString DESC_SecRun ${LANG_PORTUGUESEBR} "Executar ${APPNAME} após a instalação."

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SecMain} $(DESC_SecMain)
    !insertmacro MUI_DESCRIPTION_TEXT ${SecDesktop} $(DESC_SecDesktop)
    !insertmacro MUI_DESCRIPTION_TEXT ${SecRun} $(DESC_SecRun)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; Seção de desinstalação
Section "Uninstall"
    ; Remover arquivos
    Delete "$INSTDIR\Mercado-Neural.exe"
    Delete "$INSTDIR\*.dll"
    Delete "$INSTDIR\*.pak"
    Delete "$INSTDIR\*.bin"
    Delete "$INSTDIR\*.dat"
    Delete "$INSTDIR\*.json"
    Delete "$INSTDIR\*.html"
    Delete "$INSTDIR\version"
    Delete "$INSTDIR\LICENSE"
    Delete "$INSTDIR\uninstall.exe"
    
    ; Remover pastas
    RMDir /r "$INSTDIR\locales"
    RMDir /r "$INSTDIR\resources"
    RMDir /r "$INSTDIR\node_modules"
    RMDir /r "$INSTDIR\assets"
    RMDir /r "$INSTDIR\components"
    RMDir /r "$INSTDIR\config"
    RMDir /r "$INSTDIR\electron"
    
    ; Remover diretório principal (se vazio)
    RMDir "$INSTDIR"
    
    ; Remover atalhos
    Delete "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk"
    Delete "$SMPROGRAMS\${APPNAME}\Desinstalar.lnk"
    RMDir "$SMPROGRAMS\${APPNAME}"
    Delete "$DESKTOP\${APPNAME}.lnk"
    
    ; Remover registro
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"
SectionEnd

