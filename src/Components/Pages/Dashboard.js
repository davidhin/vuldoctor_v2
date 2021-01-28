import { Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import React, { useEffect, useState } from "react";
import fire from "../../fire.js";
import { createToken } from "../Authentication";
import VulnBoxes from "../Report/VulnBoxes";
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
  const [processing, setProcessing] = useState(undefined);
  const [loadProjects, setLoadProjects] = useState(true);
  const [authHeader, setAuthHeader] = useState(null);
  const [vulns, setVulns] = useState(null);

  const getProjects = async () => {
    setLoadProjects(true);
    const header = await createToken(props.user);
    let res = await axios.get("/getProjects", header);
    res = res["data"];
    res.map((x) => (x["status"] = "..."));
    setProjects(res);
    updateVulns(res);
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
    console.log("setProjProc");
    updateVulns(a);
  };

  const updateVulns = async (p) => {
    let v = {};
    v["HIGH"] = 0;
    v["MEDIUM"] = 0;
    v["LOW"] = 0;
    p.forEach((x) => {
      if (x["high_sev"] != undefined) {
        v["HIGH"] += x["high_sev"];
        v["MEDIUM"] += x["med_sev"];
        v["LOW"] += x["low_sev"];
      }
    });
    setVulns(v);
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
          <FileUpload
            user={props.user}
            getProjects={getProjects}
            loading={loadProjects}
            processing={processing}
          />
        </Grid>
        <Grid item xs={12} sm={3} md={3}>
          <Paper className={classes.paper}>
            <Typography variant="h5">Running Tasks</Typography>
            <br />
            <div>
              {processing === undefined ? (
                <CircularProgress />
              ) : (
                <div>
                  {processing === null
                    ? "No tasks running"
                    : Object.keys(processing).map((k) => (
                        <Paper
                          className={classes.paper}
                          style={{ margin: "10px" }}
                        >
                          {k}
                        </Paper>
                      ))}
                </div>
              )}
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <VulnBoxes vulns={vulns} classes={classes} />
        </Grid>

        <Grid item xs={12}>
          <ProjectsTable
            user={props.user}
            projects={projects}
            updateVulns={(vulns) => {
              updateVulns(vulns);
            }}
            loading={loadProjects}
            auth_header={authHeader}
            setProjProc={setProjProc}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;
