import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import "@progress/kendo-theme-material/dist/all.css";
import React, { useEffect, useState } from "react";

const VulnCards = (props) => {
  const [scan, setScan] = useState(props.scan);
  const [cveData, setCveData] = useState(props.cveData);
  const [deps, setDeps] = useState(props.deps);
  const [classes, setClasses] = useState(props.classes);

  useEffect(() => {
    setScan(props.scan);
    setCveData(props.cveData);
    setDeps(props.deps);
    setClasses(props.classes);
  }, [props.scan, props.cveData, props.deps, props.classes]);

  const Container = () => (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper className={classes.paper}>hi</Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper className={classes.paper}>hi</Paper>
        </Grid>{" "}
        <Grid item xs={12} md={6} lg={3}>
          <Paper className={classes.paper}>hi</Paper>
        </Grid>{" "}
        <Grid item xs={12} md={6} lg={3}>
          <Paper className={classes.paper}>hi</Paper>
        </Grid>
      </Grid>
    </div>
  );

  return <Container />;
};

export default VulnCards;
