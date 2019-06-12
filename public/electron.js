const { app, BrowserWindow } = require("electron");

let win;

browserWinConfig = {
  width: 800,
  height: 600,
  webPreferences: {
    nodeIntegration: true
  }
};

function createWindow() {
  win = new BrowserWindow(browserWinConfig);
  win.loadFile("./build/index.html");
  win.webContents.openDevTools();
  win.on("closed", () => (win = null));
}

app.on("ready", createWindow);
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
app.on("activate", () => win === null && createWindow());
