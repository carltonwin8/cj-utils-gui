const path = require("path");
const os = require("os");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const isDev = require("electron-is-dev");

const photoProcess = require("./photo-process");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
const url = isDev
  ? "http://localhost:3210"
  : `file://${path.join(__dirname, "../build/index.html")}`;

const devToolExtPathMac = path.join(
  os.homedir(),
  "/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.6.0_0"
);
const devToolExtPathWin = path.join(
  os.homedir(),
  "/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.6.0_0"
);
let devToolExtPath;
switch (process.platform) {
  case "win32":
    devToolExtPath = devToolExtPathWin;
    break;
  case "darwin":
    devToolExtPath = devToolExtPathMac;
    break;
}

let win;
let devToolExt;

browserWinConfig = {
  width: 1200,
  height: 600,
  webPreferences: {
    nodeIntegration: true,
    preload: path.join(__dirname, "preload.js")
  }
};

function createWindow() {
  const reactDevTools = BrowserWindow.getDevToolsExtensions().hasOwnProperty(
    "React Developer Tools"
  );
  if (isDev && devToolExtPath && !devToolExt && !reactDevTools)
    devToolExt = BrowserWindow.addDevToolsExtension(devToolExtPath);
  win = new BrowserWindow(browserWinConfig);
  win.loadURL(url);
  if (isDev) win.webContents.openDevTools();
  win.on("closed", () => (win = null));
}

app.on("ready", () => {
  createWindow();
  photoProcess.setup(win);
});

app.on("window-all-closed", () => {
  if (devToolExt) {
    BrowserWindow.removeDevToolsExtension(devToolExt);
    devToolExt = null;
  }
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => win === null && createWindow());
