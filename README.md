# Carlton's Utilites GUI

In order to run the image organization software install:

- imagemagick convert
- dcraw

For windows dcraw can be found at
http://www.centrostudiprogressofotografico.it/en/dcraw/
and the exe should be rename to dcraw and moved to the following directory.
C:/"Program Files"/ImageMagick-7.0.8-Q16/

## Minimum Create React Application With Electron

Steps Followed:

- `npx create-react-app min-cra-electron`
- edited `README.md` to contain the steps use to creat this application
- `yarn add electron -D`
- add minimum [electron.js](./public/electron.js) to the `./public` folder
- update [package.json](./package.json) with `main` and `homepage` values
- `yarn build` then `npx electron .` show application running
- `yarn add electron-builder --dev` and `yarn add typescript -D`
- `npx electron-builder`
- `yarn dist` - combines react and electron builders
- `yarn add -D concurrently cross-env nodemon wait-on`
- `yarn add electron-is-dev`

### Steps Below For Adding GUI

- `yarn add @material-ui/core`

### Steps Below For Adding Feature

- tbd

## To Do

- reduce reliance on external non js utilites
  - dcraw.c - convert c to js via [emscripten](https://emscripten.org/) as done
    [here](https://github.com/carltonwin8/dcraw.js)
