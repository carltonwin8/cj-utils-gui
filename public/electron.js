const path = require("path");
const os = require("os");
const { app, BrowserWindow } = require("electron");
const isDev2 = require("electron-is-dev");
const isDev = false;
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
const url = isDev
  ? "http://localhost:3210"
  : `file://${path.join(__dirname, "../build/index.html")}`;

const devToolExtPathMac = path.join(
  os.homedir(),
  "/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.6.0_0"
);

let win;
let devToolExt;

browserWinConfig = {
  width: 800,
  height: 600,
  webPreferences: {
    nodeIntegration: true
  }
};

function createWindow() {
  devToolExt = BrowserWindow.addDevToolsExtension(devToolExtPathMac);
  win = new BrowserWindow(browserWinConfig);
  win.loadURL(url);
  if (isDev) win.webContents.openDevTools();
  win.on("closed", () => (win = null));
}

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (devToolExt) BrowserWindow.removeDevToolsExtension(devToolExt);
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => win === null && createWindow());
