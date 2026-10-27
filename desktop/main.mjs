// Translation Desk as a Mac app: the same local server, shown in its own window.
// The page can't use Node or Electron; it talks only to the server on 127.0.0.1, as in a browser.

import { app, BrowserWindow, dialog, session, shell } from 'electron';
import { isBusy, startServer } from '../server.mjs';

app.setName('Translation Desk');
let origin = '';
let quitting = false;

if (!app.requestSingleInstanceLock()) app.quit();

const external = (url) => {
  if (/^https:\/\//.test(url)) shell.openExternal(url);
};

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 920,
    minWidth: 380,
    minHeight: 520,
    title: 'Translation Desk',
    backgroundColor: '#f6f1e8',
    show: false,
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, plugins: true, spellcheck: true },
  });
  // Links to other sites open in the browser; the window only ever shows the app
  win.webContents.setWindowOpenHandler(({ url }) => { external(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(`${origin}/`)) { e.preventDefault(); external(url); }
  });
  win.once('ready-to-show', () => win.show());
  win.loadURL(`${origin}/`);
  return win;
}

app.on('second-instance', () => {
  const [win] = BrowserWindow.getAllWindows();
  if (win) { if (win.isMinimized()) win.restore(); win.focus(); } else if (origin) createWindow();
});

app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, done) => done(false));
  try {
    const port = await startServer({ port: Number(process.env.PORT) || 4321, fallback: true });
    origin = `http://127.0.0.1:${port}`;
  } catch (err) {
    dialog.showErrorBox('Translation Desk could not start', String(err?.message || err));
    app.quit();
    return;
  }
  createWindow();
});

// On a Mac, closing the window keeps the app (and any translation) running; click the Dock icon to reopen
app.on('activate', () => { if (origin && !BrowserWindow.getAllWindows().length) createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

app.on('before-quit', (e) => {
  if (quitting || !isBusy()) return;
  const choice = dialog.showMessageBoxSync({
    type: 'warning',
    buttons: ['Keep working', 'Quit anyway'],
    defaultId: 0,
    cancelId: 0,
    message: 'A translation is still running.',
    detail: 'If you quit now, the segments finished so far are saved and you can press Translate again later for the rest.',
  });
  if (choice === 1) quitting = true;
  else e.preventDefault();
});
