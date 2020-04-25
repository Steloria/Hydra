const { app, BrowserWindow } = require('electron');
var path = require('path');
var fs = require('fs-extra');

if (process.mas) app.setName('Hydra');
let mainWindow;

let f = path.join(__dirname, 'assets/json/models.json');
if (!fs.existsSync(f)) {
  fs.ensureFile(f)
    .then(() => {
      fs.writeFile(f, JSON.stringify([]))
        .catch(err => {
          console.log('Error when creating thge file!')
          console.error(err)
        });
    })
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1280,
    minWidth: 1000,
    height: 840,
    minHeight: 600,
    title: app.name,
    icon: path.join(__dirname, 'assets/icon/png/64x64.png'),
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadFile('index.html');
  mainWindow.maximize()

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