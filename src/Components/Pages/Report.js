import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createToken } from "../Authentication";
import CVSSPlot from "../Report/CVSSPlot";

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

const Report = (props) => {
  const classes = useStyles();
  let changePage = props.changePage;
  let user = props.user;
  let { projectid } = useParams();
  const [loading, setLoading] = useState(true);
  const [bom, setBom] = useState(null);
  const [deps, setDeps] = useState(null);
  const [scan, setScan] = useState(null);

  useEffect(() => {
    changePage("Report");
    const getReportData = async () => {
      const header = await createToken(user);
      const res = await axios.get(`/getreport/${projectid}`, header);
      setBom(res["data"]["bom"]);
      setDeps(res["data"]["deps"]);
      setScan(res["data"]["scan"]);
      setLoading(false);
    };
    getReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <CVSSPlot scan={deps} />
              </Paper>
            </Grid>
          </Grid>
        </div>
      )}
    </div>
  );
};

export default Report;
