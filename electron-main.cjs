const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    title: 'عقلية | AQLIYA HQ — غرفة العمليات التكتيكية',
    backgroundColor: '#08090d',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the production build directly from disk - NO LOCALHOST AT ALL!
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  win.loadFile(indexPath);

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
