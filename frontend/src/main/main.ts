/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
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

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let cornerWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

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

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

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
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  // Listen for theme change events from the renderer process
  ipcMain.on('theme-change', (event, palette) => {
    mainWindow?.setTitleBarOverlay({
      color: palette.background.default,
      symbolColor: palette.primary.dark,
      height: 32,
    });
  });
};

/**
 * Add event listeners...
 */

app.on('ready', () => {
  createWindow();

  // Create the tray icon
  const trayIconPath = path.join(__dirname, '../../assets/tray-icon.png'); // Replace with your tray icon path
  tray = new Tray(trayIconPath);

  // Create a context menu for the tray
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '關於我的追番日記',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      },
    },
    {
      label: '結束',
      click: () => {
        app.quit();
      },
    },
  ]);

  // Set the context menu for the tray
  tray.setContextMenu(contextMenu);

  // Set a tooltip for the tray icon
  tray.setToolTip('關於我的追番日記');

  // Handle click events on the tray icon
  tray.on('click', () => {
    if (!cornerWindow) {
      const { width: screenWidth, height: screenHeight } =
        screen.getPrimaryDisplay().workAreaSize;

      cornerWindow = new BrowserWindow({
        width: 400, // Adjust width
        height: 600, // Adjust height
        x: screenWidth - 420, // Position near bottom-right corner
        y: screenHeight - 600,
        frame: false, // Frameless window
        alwaysOnTop: true, // Keep the window on top
        resizable: false, // Disable resizing
        skipTaskbar: true, // Hide from taskbar
        show: false, // Create the window hidden
        transparent: true,
        webPreferences: {
          preload: app.isPackaged
            ? path.join(__dirname, 'preload.js')
            : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
      });

      cornerWindow.loadURL(resolveHtmlPath('corner.html')); // Load your custom HTML

      cornerWindow.on('closed', () => {
        cornerWindow = null;
      });
    }

    // Toggle visibility
    if (cornerWindow) {
      if (cornerWindow.isVisible()) {
        cornerWindow.hide();
      } else {
        cornerWindow.show();
      }
    }
  });
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    //app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
