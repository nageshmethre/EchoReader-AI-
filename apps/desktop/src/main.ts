import { app, BrowserWindow, ipcMain, globalShortcut, Menu, Tray, Notification, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load the compiled Vite code or dev server
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ----------------------------------------------------------------------
// SYSTEM TRAY SETUP
// ----------------------------------------------------------------------
function createTray() {
  // Use a transparent PNG placeholder path for the tray icon
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  // Check if icon exists, fallback if not
  const hasIcon = fs.existsSync(iconPath);
  
  tray = new Tray(hasIcon ? iconPath : nativeImage.createEmpty()); // empty icon fallback
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open EchoReader AI', click: () => mainWindow?.show() },
    { label: 'Play / Pause Speech', click: () => mainWindow?.webContents.send('tts-toggle') },
    { type: 'separator' },
    { label: 'Quit Application', click: () => app.quit() }
  ]);

  tray.setToolTip('EchoReader AI');
  tray.setContextMenu(contextMenu);
}

// ----------------------------------------------------------------------
// APPLICATION LIFECYCLE
// ----------------------------------------------------------------------
app.whenReady().then(() => {
  createWindow();
  createTray();

  // Global Shortcuts for playback control
  globalShortcut.register('CommandOrControl+Alt+Space', () => {
    mainWindow?.webContents.send('tts-toggle');
    new Notification({
      title: 'EchoReader AI',
      body: 'Playback state toggled via global shortcut.'
    }).show();
  });

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

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// ----------------------------------------------------------------------
// IPC CHANNELS & OFFLINE METRIC SYNCING
// ----------------------------------------------------------------------
ipcMain.handle('read-local-file', async (_, filePath: string) => {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) throw new Error('File does not exist');
    const content = await fs.promises.readFile(fullPath);
    return content;
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('save-offline-bookmark', async (_, bookmarkData: any) => {
  try {
    const dataDir = path.join(app.getPath('userData'), 'local_db');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const bookmarkFile = path.join(dataDir, 'bookmarks.json');
    let current: any[] = [];
    if (fs.existsSync(bookmarkFile)) {
      current = JSON.parse(await fs.promises.readFile(bookmarkFile, 'utf-8'));
    }
    current.push({ ...bookmarkData, id: Date.now().toString(), createdAt: new Date() });
    await fs.promises.writeFile(bookmarkFile, JSON.stringify(current, null, 2));
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
});
