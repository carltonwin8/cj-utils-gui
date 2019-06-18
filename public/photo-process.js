const { ipcMain, dialog } = require("electron");

const photos = require("cj-photo-process")({ getApi: true });

const setup = win => {
  const { webContents } = win;
  let jpgFiles;
  let cwd;
  const t = ti => webContents.send("photos:status:total", ti);
  const tj = tji => webContents.send("photos:status:jpegtotal", tji);

  ipcMain.on("photos:gui:ready", () => {
    cwd = process.cwd();
    webContents.send("photos:set:dir", cwd);
  });

  ipcMain.on("photos:get:dir", async () => {
    const dirs = dialog.showOpenDialog(win, {
      properties: ["openDirectory"]
    });
    if (dirs && dirs.length > 0) {
      webContents.send("photos:set:dir", dirs[0]);
      try {
        ({ rawFiles, jpgFiles } = await photos.getFiles(cwd, t, tj));
      } catch (e) {
        console.error("No image files found error:", e);
      }
    }
  });

  const r = ri => webContents.send("photos:status:extractRaw", ri);
  const j = ji => webContents.send("photos:status:jpeg", ji);
  const c = ci => webContents.send("photos:status:convert", ci);
  const errMsg = ei => webContents.send("photos:error", ei);

  ipcMain.on("photos:reset", (_, cwd) => photos.reset(cwd, t, r, c, tj, j));
  ipcMain.on("photos:process", async (_, cwd, resolution) => {
    if (!rawFiles && !jpgFiles)
      ({ rawFiles, jpgFiles } = await photos.getFiles(cwd, t, tj));

    console.log("processing");
    photos
      .develope(cwd, resolution, r, c, j, rawFiles, jpgFiles)
      .then(() => webContents.send("photos:status:finished"))
      .catch(err => errMsg(err));
  });
};

module.exports = {
  setup
};
