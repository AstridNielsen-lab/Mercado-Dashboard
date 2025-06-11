const { app, BrowserWindow, Menu, dialog, shell, ipcMain, protocol } = require('electron');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Initialize electron store
const store = new Store();

// Keep a global reference of the window object
let mainWindow;
let splashWindow;

// Enable live reload for Electron in development
if (isDev) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    splashWindow.loadFile(path.join(__dirname, 'splash.html'));

    splashWindow.on('closed', () => {
        splashWindow = null;
    });

    // Close splash after 3 seconds
    setTimeout(() => {
        if (splashWindow) {
            splashWindow.close();
        }
        createWindow();
    }, 3000);
}

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        show: false,
        icon: path.join(__dirname, '..', 'assets', 'images', 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: !isDev
        },
        titleBarStyle: 'default',
        autoHideMenuBar: false
    });

    // Load the index.html of the app
    mainWindow.loadFile('index.html');

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Set up menu
    createMenu();

    // Auto updater events
    if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify();
    }
}

function createMenu() {
    const template = [
        {
            label: 'Arquivo',
            submenu: [
                {
                    label: 'Exportar Dados',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        mainWindow.webContents.send('export-data');
                    }
                },
                {
                    label: 'Importar Dados',
                    accelerator: 'CmdOrCtrl+I',
                    click: async () => {
                        const result = await dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [
                                { name: 'JSON Files', extensions: ['json'] },
                                { name: 'All Files', extensions: ['*'] }
                            ]
                        });
                        
                        if (!result.canceled) {
                            mainWindow.webContents.send('import-data', result.filePaths[0]);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Configurações',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        mainWindow.webContents.send('open-settings');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Sair',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Visualizar',
            submenu: [
                {
                    label: 'Recarregar',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.webContents.reload();
                    }
                },
                {
                    label: 'Forçar Recarregamento',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: () => {
                        mainWindow.webContents.reloadIgnoringCache();
                    }
                },
                {
                    label: 'Ferramentas do Desenvolvedor',
                    accelerator: 'F12',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Zoom Atual',
                    accelerator: 'CmdOrCtrl+0',
                    click: () => {
                        mainWindow.webContents.setZoomLevel(0);
                    }
                },
                {
                    label: 'Aumentar Zoom',
                    accelerator: 'CmdOrCtrl+Plus',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomLevel();
                        mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
                    }
                },
                {
                    label: 'Diminuir Zoom',
                    accelerator: 'CmdOrCtrl+-',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomLevel();
                        mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Tela Cheia',
                    accelerator: 'F11',
                    click: () => {
                        const isFullScreen = mainWindow.isFullScreen();
                        mainWindow.setFullScreen(!isFullScreen);
                    }
                }
            ]
        },
        {
            label: 'Dashboard',
            submenu: [
                {
                    label: 'Atualizar Dados',
                    accelerator: 'F5',
                    click: () => {
                        mainWindow.webContents.send('refresh-data');
                    }
                },
                {
                    label: 'IA Assistant',
                    accelerator: 'CmdOrCtrl+K',
                    click: () => {
                        mainWindow.webContents.send('open-ai-chat');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Modo Escuro',
                    type: 'checkbox',
                    checked: store.get('darkMode', false),
                    click: (menuItem) => {
                        store.set('darkMode', menuItem.checked);
                        mainWindow.webContents.send('toggle-dark-mode', menuItem.checked);
                    }
                }
            ]
        },
        {
            label: 'Ajuda',
            submenu: [
                {
                    label: 'Sobre o Mercado Neural',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Sobre o Mercado Neural',
                            message: 'Mercado Neural v1.0.0',
                            detail: 'Dashboard Financeira Inteligente com IA integrada.\n\nDesenvolvido para análise de investimentos em criptomoedas e ações.\n\n© 2024 Mercado Neural Team'
                        });
                    }
                },
                {
                    label: 'Documentação',
                    click: () => {
                        shell.openExternal('https://github.com/AstridNielsen-lab/Mercado-Dashboard-Neural');
                    }
                },
                {
                    label: 'Verificar Atualizações',
                    click: () => {
                        if (!isDev) {
                            autoUpdater.checkForUpdatesAndNotify();
                        } else {
                            dialog.showMessageBox(mainWindow, {
                                type: 'info',
                                title: 'Verificar Atualizações',
                                message: 'Verificação de atualizações não disponível no modo de desenvolvimento.'
                            });
                        }
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('store-get', (event, key, defaultValue) => {
    return store.get(key, defaultValue);
});

ipcMain.handle('store-set', (event, key, value) => {
    store.set(key, value);
    return true;
});

ipcMain.handle('store-delete', (event, key) => {
    store.delete(key);
    return true;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
});

ipcMain.handle('show-message-box', async (event, options) => {
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
});

ipcMain.handle('shell-open-external', (event, url) => {
    shell.openExternal(url);
    return true;
});

// App event handlers
app.whenReady().then(() => {
    // Register protocol for local files
    protocol.registerFileProtocol('local-file', (request, callback) => {
        const url = request.url.substr(12);
        callback({ path: path.normalize(url) });
    });

    createSplashWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});

// Auto updater events
autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
    console.log('Update available.');
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Atualização Disponível',
        message: 'Uma nova versão está disponível. Será baixada em segundo plano.',
        detail: `Versão atual: ${app.getVersion()}\nNova versão: ${info.version}`
    });
});

autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Atualização Baixada',
        message: 'A atualização foi baixada. A aplicação será reiniciada para aplicar a atualização.',
        buttons: ['Reiniciar Agora', 'Mais Tarde']
    }).then((result) => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });

    contents.on('will-navigate', (event, url) => {
        if (url !== contents.getURL()) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (isDev) {
        // In development, ignore certificate errors
        event.preventDefault();
        callback(true);
    } else {
        // In production, use default behavior
        callback(false);
    }
});

// Prevent navigation to external websites
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (navigationEvent, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        if (parsedUrl.origin !== 'file://') {
            navigationEvent.preventDefault();
        }
    });
});

console.log('Mercado Neural Desktop App initialized');

