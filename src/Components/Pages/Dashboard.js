import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import React, { useEffect, useState } from "react";
import fire from "../../fire.js";
import { createToken } from "../Authentication";
import Demo from "../Report/Demo";
import ProjectsTable from "../Tables/ProjectsTable";
import FileUpload from "./FileUpload";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.primary,
    height: "100%",
  },
}));

function Dashboard(props) {
  const classes = useStyles();
  const [projects, setProjects] = useState([]);
  const [processing, setProcessing] = useState(null);
  const [loadProjects, setLoadProjects] = useState(true);
  const [authHeader, setAuthHeader] = useState(null);

  const getProjects = async () => {
    setLoadProjects(true);
    const header = await createToken(props.user);
    let res = await axios.get("/getProjects", header);
    res = res["data"];
    res.map((x) => (x["status"] = "..."));
    setProjects(res);
  };

  const setProjProc = async (d, header) => {
    let res = await axios.get("/getProjects", header);
    let a = res["data"];
    if (d.val()) {
      a.map(
        (x) => (x["status"] = d.val()[x.pid] ? "Processing..." : "Complete")
      );
    } else {
      a.map((x) => (x["status"] = "Complete"));
    }
    setProjects(a);
    setLoadProjects(false);
    console.log("SET");
  };

  useEffect(() => {
    props.changePage("Dashboard");
    let pstatus = fire.database().ref("/" + props.user.uid);
    const l = pstatus.on("value", async (d) => {
      if (d) {
        setProcessing(d.val() ? d.val() : null);
        const header = await createToken(props.user);
        setAuthHeader(header);
        setProjProc(d, header);
      }
    });
    return () => l();
  }, []);

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={9}>
          <Paper className={classes.paper}>
            <FileUpload user={props.user} getProjects={getProjects} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3} md={3}>
          <Paper className={classes.paper}>
            <Typography variant="h5">Running Tasks</Typography>
            <br />
            <div>
              {!processing
                ? "No tasks running"
                : Object.keys(processing).map((k) => (
                    <Paper className={classes.paper} style={{ margin: "10px" }}>
                      {k}
                    </Paper>
                  ))}
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <ProjectsTable
            user={props.user}
            projects={projects}
            getProjects={getProjects}
            loading={loadProjects}
            auth_header={authHeader}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={6}>
          <Paper className={classes.paper}>
            <Demo />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={6}>
          <Paper className={classes.paper}></Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;
