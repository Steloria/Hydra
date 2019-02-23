const { app, BrowserWindow } = require('electron');
var path = require('path');
var fs = require('fs');

if (process.mas) app.setName('Hydra');
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1280,
    minWidth: 1000,
    height: 840,
    minHeight: 600,
    title: app.getName(),
    icon: path.join(__dirname, 'assets/icon/png/64x64.png')
  });
  mainWindow.loadFile('index.html');
  mainWindow.maximize()

  mainWindow.on('closed', function () {
    mainWindow = null;
  })

  let f = path.join(__dirname, 'assets/json/models.json');
  if (!fs.existsSync(f)) {
    fs.writeFile(f, JSON.stringify("[]"), function(err) {
        if (err) console.log(err);
    });
  }
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