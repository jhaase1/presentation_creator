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
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import addSlidesToPresentation from './copySlidesToPPTX';

const userDataPath = app.getPath('userData');
const appSettingsPath = path.join(userDataPath, 'AppSettings.json');

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('show-save-dialog', async (event, defaultPath, filters) => {
  const result = dialog.showSaveDialogSync({
    title: 'Save As',
    defaultPath,
    filters,
  });
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = dialog.showOpenDialogSync(options);
  return result;
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
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

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
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.handle('merge-presentations', async (event, yamlState: string) => {
  try {
    // Run AddSlidesToPresentation first
    addSlidesToPresentation(yamlState);
  } catch (error) {
    if (typeof error === 'string') {
      return { status: 'error', message: error };
    }
    if (error instanceof Error) {
      return { status: 'error', message: error.message };
    }
  }
  return { status: 'success' };
});

ipcMain.handle('write-text-file', async (event, filePath, contents) => {
  try {
    fs.writeFileSync(filePath, contents, 'utf8');
  } catch (error) {
    if (typeof error === 'string') {
      return { status: 'error', message: error };
    }
    if (error instanceof Error) {
      return { status: 'error', message: error.message };
    }
  }

  return { status: 'success' };
});

ipcMain.handle('read-text-file', async (event, filePath) => {
  try {
    const contents = fs.readFileSync(filePath, 'utf8');
    return contents;
  } catch (error) {
    if (typeof error === 'string') {
      return { status: 'error', message: error };
    }
    if (error instanceof Error) {
      return { status: 'error', message: error.message };
    }
  }

  return { status: null };
});

ipcMain.handle('get-app-settings', async () => {
  try {
    const data = fs.readFileSync(appSettingsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error reading settings:', error.message);
      return { status: 'error', message: error.message };
    }
    return { status: 'error', message: 'Unknown error' };
  }
});

ipcMain.handle('set-app-settings', async (event, newSettings) => {
  try {
    let currentSettings = {};

    // Check if the settings file exists
    if (fs.existsSync(appSettingsPath)) {
      // Read current settings
      const currentSettingsData = fs.readFileSync(appSettingsPath, 'utf8');
      currentSettings = JSON.parse(currentSettingsData);
    }

    // Merge current settings with new settings
    const updatedSettings = { ...currentSettings, ...newSettings };

    // Write updated settings back to file
    const data = JSON.stringify(updatedSettings, null, 2);
    fs.writeFileSync(appSettingsPath, data, 'utf8');
    return { status: 'success' };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error writing settings:', error.message);
      return { status: 'error', message: error.message };
    }
    return { status: 'error', message: 'Unknown error' };
  }
});

ipcMain.handle('path-parse', async (event, p: string) => {
  try {
    const pathObject = path.parse(p);
    return { status: 'success', value: pathObject };
  } catch (error) {
    return { status: 'error', message: 'Unknown error' };
  }
});

ipcMain.handle('path-format', async (event, pathObject: object) => {
  try {
    const p = path.format(pathObject);
    return { status: 'success', value: p };
  } catch (error) {
    return { status: 'error', message: 'Unknown error' };
  }
});
