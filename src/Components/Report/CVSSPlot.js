import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: "100%",
  },
}));

const CVSSPlot = (props) => {
  const classes = useStyles();
  const [scan, setScan] = useState(props.scan);

  useEffect(() => {
    setScan(props.scan);
    console.log(scan);
  }, [props.scan]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={9}>
        <Paper className={classes.paper}>dsdf</Paper>
      </Grid>
    </Grid>
  );
};

export default CVSSPlot;
