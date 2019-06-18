import React, { useState, useEffect } from "react";
import "typeface-roboto";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Grid from "@material-ui/core/Grid";

const debug = false;

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(),
    minWidth: 100
  },
  noNewLine: {
    display: "inline-block",
    marginLeft: "16px"
  },
  label: {
    display: "inline-block",
    marginRight: "10px"
  },
  progress: {
    margin: theme.spacing(2)
  },
  grid: {
    gridTemplateColumns: "1fr",
    gridAutoFlow: "row"
  },
  rightIcon: {
    marginLeft: theme.spacing(1)
  }
}));

function Photos() {
  const classes = useStyles();
  const [cwd, cwdSet] = useState("");
  const [error, errorSet] = useState(null);
  const [total, totalSet] = useState(0);
  const [jpegtotal, jpegtotalSet] = useState(0);
  const [extractRaw, extractRawSet] = useState(0);
  const [jpeg, jpegSet] = useState(0);
  const [convert, convertSet] = useState(0);
  const [resolution, resolutionSet] = useState("1620x1080");
  const [running, runningSet] = useState(false);

  useEffect(() => {
    window.ipcRenderer.on("photos:set:dir", (_, item) => {
      console.log("p:g:r cwd", item);
      if (debug) item = "/Users/carltonjoseph/dogs";
      cwdSet(item);
    });
    window.ipcRenderer.on("photos:error", (_, error) => {
      errorSet(error);
      runningSet(false);
    });
    window.ipcRenderer.on("photos:status:total", (_, total) => totalSet(total));
    window.ipcRenderer.on("photos:status:extractRaw", (_, extractRaw) =>
      extractRawSet(extractRaw)
    );
    window.ipcRenderer.on("photos:status:convert", (_, convert) =>
      convertSet(state => state + convert)
    );
    window.ipcRenderer.on("photos:status:jpeg", (_, jpeg) =>
      jpegSet(state => state + jpeg)
    );
    window.ipcRenderer.on("photos:status:jpegtotal", (_, jpegtotal) =>
      jpegtotalSet(jpegtotal)
    );
    window.ipcRenderer.on("photos:status:finished", () => runningSet(false));
    window.ipcRenderer.send("photos:gui:ready");
  }, []);

  const onSelectDirectory = e => window.ipcRenderer.send("photos:get:dir");
  const onReset = e => window.ipcRenderer.send("photos:reset", cwd);
  const onProcessPhotos = e => {
    totalSet(0);
    extractRawSet(0);
    convertSet(0);
    runningSet(true);
    window.ipcRenderer.send("photos:process", cwd, resolution);
  };
  const onClearError = e => errorSet(null);

  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h4" component="h2">
          Photo Processing
        </Typography>
      </CardContent>
      <CardActions>
        <Grid container className={classes.grid} spacing={1}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={onSelectDirectory}
            >
              Change Selected Directory
            </Button>
            <Typography
              className={classes.noNewLine}
              color="secondary"
              component="span"
            >
              {cwd}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={onProcessPhotos}
            >
              Process Photos
            </Button>
            {debug ? (
              <Button size="small" color="secondary" onClick={onReset}>
                Reset
              </Button>
            ) : null}
          </Grid>
          <Grid item>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="resolution">Resolution</InputLabel>
              <Select
                value={resolution}
                onChange={e =>
                  console.log(e.target) || resolutionSet(e.target.value)
                }
                input={<Input name="resolution" id="resolution" />}
                autoWidth
              >
                <MenuItem value="1024x768">1024x768</MenuItem>
                <MenuItem value="1620x1080">1620x1080</MenuItem>
                <MenuItem value="1920x1280">1920x1280</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {error ? (
            <Typography color="secondary" variant="h6" component="h6">
              {error}
            </Typography>
          ) : null}
          {total ? (
            <Typography color="primary">
              RAW Extracted: {extractRaw} / {total}, resized: {convert} /{" "}
              {total}
            </Typography>
          ) : null}
          {jpegtotal ? (
            <Typography color="primary">
              JPEG resized: {jpeg} / {jpegtotal}
            </Typography>
          ) : null}
          {running ? <CircularProgress className={classes.progress} /> : null}

          {error && (
            <Button size="small" color="secondary" onClick={onClearError}>
              Clear Error
            </Button>
          )}
        </Grid>
      </CardActions>
    </Card>
  );
}

export default Photos;
