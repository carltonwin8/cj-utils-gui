const { ipcMain, dialog } = require("electron");

const photos = require("cj-photo-process")({ getApi: true });

const debug = false;

const setup = win => {
  const { webContents } = win;
  let rawFiles;
  let jpgFiles;
  let cwd;
  const t = ti => webContents.send("photos:status:total", ti);
  const tj = tji => webContents.send("photos:status:jpegtotal", tji);

  const getFiles = async () => {
    try {
      ({ rawFiles, jpgFiles } = await photos.getFiles(cwd, t, tj));
    } catch (e) {
      console.error("No image files found error:", e);
    }
  };

  ipcMain.on("photos:gui:ready", () => {
    if (debug) cwd = "/Users/carltonjoseph/dogs";
    else cwd = process.cwd();
    webContents.send("photos:set:dir", cwd);
    getFiles();
  });

  ipcMain.on("photos:get:dir", () => {
    const dirs = dialog.showOpenDialog(win, { properties: ["openDirectory"] });
    if (dirs && dirs.length > 0) {
      cwd = dirs[0];
      webContents.send("photos:set:dir", cwd);
      getFiles();
    }
  });

  const r = ri => webContents.send("photos:status:extractRaw", ri);
  const j = ji => webContents.send("photos:status:jpeg", ji);
  const c = ci => webContents.send("photos:status:convert", ci);
  const errMsg = ei => webContents.send("photos:error", ei);

  ipcMain.on("photos:reset", (_, cwd) => {
    photos.reset(cwd, t, r, c, tj, j);
    getFiles();
  });

  ipcMain.on("photos:process", async (_, cwd, resolution) => {
    if (!rawFiles && !jpgFiles) return errMsg(`No image files found in ${cwd}`);
    photos
      .develope(cwd, resolution, r, c, j, rawFiles, jpgFiles)
      .then(() => {
        webContents.send("photos:status:finished");
        rawFiles = null;
        jpgFiles = null;
      })
      .catch(err => console.log("p.d", err) || errMsg(JSON.stringify(err)));
  });
};

module.exports = {
  setup
};
