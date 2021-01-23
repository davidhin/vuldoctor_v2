import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import "@progress/kendo-theme-material/dist/all.css";
import React, { useEffect, useState } from "react";

const VulnCards = (props) => {
  const [vulns, setVulns] = useState(props.vulns);
  const [classes, setClasses] = useState(props.classes);

  useEffect(() => {
    setVulns(props.vulns);
    setClasses(props.classes);
  }, [props.vulns, props.classes]);

  const Container = () => (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper
            className={classes.paper}
            style={{
              background:
                vulns["HIGH"] > 0 ? "rgb(244, 67, 54)" : "rgb(0, 150, 136)",
              color: "white",
            }}
          >
            <Typography variant="h5" style={{ fontWeight: 300 }}>
              High Severity: {vulns["HIGH"]}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            className={classes.paper}
            style={{
              background:
                vulns["MEDIUM"] > 0 ? "rgb(229, 115, 115)" : "rgb(0, 150, 136)",
              color: "white",
            }}
          >
            <Typography variant="h5" style={{ fontWeight: 300 }}>
              Medium Severity: {vulns["MEDIUM"]}
            </Typography>
          </Paper>
        </Grid>{" "}
        <Grid item xs={12} md={4}>
          <Paper
            className={classes.paper}
            style={{
              background:
                vulns["LOW"] > 0 ? "rgb(255, 205, 210)" : "rgb(0, 150, 136)",
              color: vulns["LOW"] > 0 ? "black" : "white",
            }}
          >
            <Typography variant="h5" style={{ fontWeight: 300 }}>
              Low Severity: {vulns["LOW"]}
            </Typography>
          </Paper>
        </Grid>{" "}
      </Grid>
    </div>
  );

  return <Container />;
};

export default VulnCards;
