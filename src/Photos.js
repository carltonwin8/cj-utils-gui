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

const debug = true;

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(),
    minWidth: 100
  },
  noNewLine: {
    display: "inline-block"
  },
  label: {
    display: "inline-block",
    marginRight: "10px"
  },
  progress: {
    margin: theme.spacing(2)
  }
}));

function Photos() {
  const classes = useStyles();
  const [path, pathSet] = useState("");
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
      if (debug) item = "/Users/carltonjoseph/160_1212";
      pathSet(item);
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
  const onReset = e => window.ipcRenderer.send("photos:reset", path);
  const onProcessPhotos = e => {
    totalSet(0);
    extractRawSet(0);
    convertSet(0);
    runningSet(true);
    window.ipcRenderer.send("photos:process", path, resolution);
  };
  const onClearError = e => errorSet(null);

  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h4" component="h2">
          Photo Processing
        </Typography>
        <div>
          <Typography className={classes.label} variant="h6" component="h6">
            Selected Directory:
          </Typography>
          <Typography
            className={classes.noNewLine}
            color="secondary"
            component="span"
          >
            {path}
          </Typography>
        </div>
        {error ? (
          <Typography color="secondary" variant="h6" component="h6">
            {error}
          </Typography>
        ) : null}
        {total ? (
          <Typography color="primary">
            RAW Extracted: {extractRaw} / {total}, resized: {convert} / {total}
          </Typography>
        ) : null}
        {jpegtotal ? (
          <Typography color="primary">
            JPEG resized: {jpeg} / {jpegtotal}
          </Typography>
        ) : null}
        {running ? <CircularProgress className={classes.progress} /> : null}
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" onClick={onSelectDirectory}>
          Change Selected Directory
        </Button>
        <Button size="small" color="primary" onClick={onProcessPhotos}>
          Process Photos
        </Button>
        {error && (
          <Button size="small" color="secondary" onClick={onClearError}>
            Clear Error
          </Button>
        )}
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
        {debug ? (
          <Button size="small" color="primary" onClick={onReset}>
            Reset
          </Button>
        ) : null}
      </CardActions>
    </Card>
  );
}

export default Photos;
