const path = require("path");
const os = require("os");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const isDev = require("electron-is-dev");

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
  height: 400,
  webPreferences: {
    nodeIntegration: true,
    preload: path.join(__dirname, "preload.js")
  }
};

function createWindow() {
  if (isDev && devToolExtPath)
    devToolExt = BrowserWindow.addDevToolsExtension(devToolExtPath);
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

ipcMain.on("photos:gui:ready", (event, arg) =>
  win.webContents.send("photos:set:dir", process.cwd(), arg)
);
ipcMain.on("photos:get:dir", () => {
  const dirs = dialog.showOpenDialog(win, {
    properties: ["openDirectory"]
  });
  if (dirs && dirs.length > 0) win.webContents.send("photos:set:dir", dirs[0]);
});
const t = ti => win.webContents.send("photos:status:total", ti);
const tj = tji => win.webContents.send("photos:status:jpegtotal", tji);
const r = ri => win.webContents.send("photos:status:extractRaw", ri);
const j = ji => win.webContents.send("photos:status:jpeg", ji);
const c = ci => win.webContents.send("photos:status:convert", ci);
const errMsg = ei => win.webContents.send("photos:error", ei);

ipcMain.on("photos:reset", (e, cwd) => photos.reset(cwd, t, r, c, tj, j));
ipcMain.on(
  "photos:process",
  (e, cwd, resolution) =>
    console.log("processing") &&
    photos
      .develope(cwd, resolution, t, r, c, tj, j)
      .then(() => win.webContents.send("photos:status:finished"))
      .catch(err => errMsg(err))
);
