const {app, BrowserWindow} = require('electron');
var path = require('path');

if (process.mas) app.setName('Codes Snippets');
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1280,
    minWidth: 1000,
    height: 840,
    title: app.getName(),
    icon: path.join(__dirname, 'assets/icon/png/64x64.png')
  });
  mainWindow.loadFile('index.html');
  //mainWindow.maximize()

  mainWindow.on('closed', function () {
    mainWindow = null;
  })
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});