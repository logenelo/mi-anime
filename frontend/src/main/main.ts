import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Tray,
  Menu,
  screen,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
console.log('日志文件路径:', log.transports.file.getFile().path);
log.transports.file.level = 'debug';

if (app.isPackaged) {
  const ex = process.execPath;
  app.setLoginItemSettings({
    openAtLogin: true,
    path: ex,
    args: ['--openAsHidden'],
  });
}

class AppUpdater {
  constructor() {
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let cornerWindow: BrowserWindow | null = null;

const gotTheLock = app.requestSingleInstanceLock();


ipcMain.on('ipc-example', async (event, arg) => {
  event.reply('ipc-example', arg);
});

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    log.info('Second instance attempted, activating main window');

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });

  const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

  if (isDebug) {
    require('electron-debug')();
  }

  const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
      .default(
        extensions.map((name) => installer[name]),
        forceDownload,
      )
      .catch(console.log);
  };

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  const quitApp = () => {
    // Destroy all windows
    if (cornerWindow) {
      cornerWindow.destroy();
      cornerWindow = null;
    }

    if (mainWindow) {
      mainWindow.destroy();
      mainWindow = null;
    }

    // Remove tray
    if (tray) {
      tray.destroy();
      tray = null;
    }

    app.quit();
  };

  const createWindow = async () => {
    log.info('Creating main window');
    if (isDebug) {
      await installExtensions();
    }

    mainWindow = new BrowserWindow({
      show: false,
      width: 1024,
      height: 728,
      icon: getAssetPath('icon.png'),
      titleBarStyle: 'hidden',
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
      ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    });
    mainWindow.setTitle('關於我的追番日記');
    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadURL(resolveHtmlPath('index.html'));

    mainWindow.on('ready-to-show', () => {
      log.info('MainWindow ready to show');
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.argv.indexOf('--openAsHidden') < 0) {
        if (process.env.START_MINIMIZED) {
          mainWindow.minimize();
        } else {
          mainWindow.restore();
          mainWindow.show();
        }
      }
    });

    mainWindow.on('closed', () => {
      mainWindow?.hide();
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    mainWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    new AppUpdater();

    if (process.platform !== 'darwin') {
      ipcMain.on('theme-change', (event, palette) => {
        mainWindow?.setTitleBarOverlay({
          color: palette.background.default,
          symbolColor: palette.primary.dark,
          height: 32,
        });
      });
    }
  };
  const createCornerWindow = () => {
    log.info('Creating corner window');

    const { width: screenWidth, height: screenHeight } =
      screen.getPrimaryDisplay().workAreaSize;

    cornerWindow = new BrowserWindow({
      width: 400,
      height: 600,
      x: screenWidth - 420,
      y: screenHeight - 600,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      show: false,
      transparent: true,
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    cornerWindow.loadURL(resolveHtmlPath('corner.html'));

    cornerWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    cornerWindow.webContents.on('will-navigate', (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

    cornerWindow.on('closed', () => {
      cornerWindow = null;
    });

    // Add ready-to-show event
    cornerWindow.on('ready-to-show', () => {
      if (!cornerWindow) {
        return log.error('Corner window is not defined');
      }
      cornerWindow.show();
    });
  };

  const createTray = () => {
    const trayIconPath = getAssetPath('tray-icon.png');
    tray = new Tray(trayIconPath);
    // Create a context menu for the tray
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '關於我的追番日記',
        click: () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
          } else {
            createWindow();
          }
        },
      },
      {
        label: '結束',
        click: () => {
          quitApp();
        },
      },
    ]);
    // Move corner window creation outside click handler

    tray.setContextMenu(contextMenu);
    tray.setToolTip('關於我的追番日記');

    // Modify click handler
    tray.on('click', async () => {
      try {
        log.debug('Tray clicked');
        if (!cornerWindow) {
          createCornerWindow();
        } else {
          log.debug('Corner window visible', cornerWindow.isVisible());
          if (cornerWindow.isVisible()) {
            cornerWindow.hide();
          } else {
            cornerWindow.show();
            cornerWindow.focus();
          }
        }
      } catch (error) {
        log.error('Tray click error:', error);
      }
    });
  };

  app.whenReady().then(() => {
    createWindow();
    createTray();
    if (process.argv.indexOf('--openAsHidden') >= 0) {
      createCornerWindow();
    }

    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  });

  // Modify the window-all-closed event handler
  app.on('window-all-closed', () => {
    // Don't quit if on macOS (keep app running without windows)
    if (process.platform !== 'darwin') {
      // You can choose to keep the app running with tray or quit
      // If you want to keep it running with tray, leave this empty
      // If you want to quit, uncomment the following:
      // app.quit();
    }
  });
  app.on('before-quit', () => {
    if (tray) {
      tray.destroy();
    }
  });

  process.on('uncaughtException', (error) => {
    log.error('Uncaught exception:', error);
  });
}
