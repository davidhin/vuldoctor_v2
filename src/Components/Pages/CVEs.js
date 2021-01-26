import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "left",
    color: theme.palette.text.primary,
    height: "100%",
  },
}));

const CVEs = (props) => {
  const classes = useStyles();
  const [searchRef, setSearchRef] = useState("");
  const [cves, setCves] = useState([]);
  let history = useHistory();

  let location = useLocation();
  let changePage = props.changePage;

  useEffect(() => {
    changePage("CVE Search");
    const search = queryString.parse(location.search)["search"];
    const getEntries = async () => {
      let results = await axios.get("/search/cve?search=" + search);
      setCves(results["data"]);
    };
    if (typeof search !== "undefined") {
      getEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location]);

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              history.push("/cves?search=" + searchRef.value);
            }}
          >
            <TextField
              fullWidth
              id="outlined-basic"
              label="Search CVEs"
              variant="outlined"
              inputRef={(ref) => {
                setSearchRef(ref);
              }}
            />
          </form>
        </Grid>
        <Grid item container spacing={2}>
          {cves.map((c) => (
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Typography variant="h5">{c.cve_id}</Typography>
                <Typography variant="body1">{c.description}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </div>
  );
};

export default CVEs;
