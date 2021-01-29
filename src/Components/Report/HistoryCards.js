import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import "@progress/kendo-theme-material/dist/all.css";
import React, { useEffect, useState } from "react";
import CVEDialog from "./CVEDialog";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1.5),
    color: theme.palette.text.primary,
    height: "100%",
  },
}));

const VulnCards = (props) => {
  const classes = useStyles();
  const [hist, setHist] = useState(null);
  const [cards, setCards] = useState(null);

  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  useEffect(() => {
    setHist(props.hist);
    if (props.hist) {
      let tempcards = groupBy(props.hist, "package");
      setCards(tempcards);
    }
  }, [props.hist]);

  const preventDefault = (event, lib) => {
    event.preventDefault();
    window.open("https://libraries.io/" + lib);
  };

  const Container = () => {
    return (
      <div>
        {!cards ? null : (
          <Paper
            className={classes.paper}
            style={{ marginBottom: "16px", background: "#424242" }}
          >
            <Typography
              variant="h4"
              style={{
                fontWeight: "300",
                display: "inline-block",
                marginRight: "16px",
                marginBottom: "16px",
                color: "#fff",
              }}
            >
              {props.notifydate}
            </Typography>

            <Grid item container spacing={2}>
              {Object.entries(cards).map((e) => {
                return (
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <Grid item container spacing={2}>
                        <Grid item xs={12}>
                          <Typography
                            variant="h6"
                            style={{
                              fontWeight: "300",
                              display: "inline-block",
                              marginRight: "16px",
                            }}
                          >
                            {e[0]}
                          </Typography>

                          <Link
                            href="#"
                            onClick={(event) => {
                              preventDefault(event, e[0].split(":").join("/"));
                            }}
                          >
                            libraries.io
                          </Link>

                          <div>
                            {e[1].map((x) => (
                              <Grid item xs={12}>
                                <Paper
                                  className={classes.paper}
                                  style={{
                                    marginTop: "12px",
                                    background: "#f5f5f5",
                                  }}
                                >
                                  <Grid item container>
                                    <Grid item xs={4}>
                                      <Typography variant="h6">
                                        {x.id}
                                      </Typography>
                                      <Typography
                                        style={{
                                          marginTop: "4px",
                                          color: "rgb(0, 150, 136)",
                                          fontWeight: 800,
                                        }}
                                        variant="subtitle1"
                                      >
                                        Upgrade to: {x.fix_version}
                                      </Typography>
                                      <Typography variant="subtitle2">
                                        Affects: {x.version}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={5}>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        Package Usage: {x.package_usage}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        Severity: {x.severity}
                                      </Typography>
                                      <CVEDialog
                                        cve_id={x.id}
                                        cve_description={x.short_description}
                                        related_urls={x.related_urls}
                                      />
                                    </Grid>

                                    <Grid
                                      item
                                      xs={3}
                                      style={{ textAlign: "right" }}
                                    >
                                      <Typography
                                        variant="overline"
                                        color="textSecondary"
                                      >
                                        CVSS Score
                                      </Typography>
                                      <Typography
                                        style={{
                                          fontWeight: x.cvss_score * 100 + 100,
                                          color: "#ff1744",
                                        }}
                                        variant="h3"
                                      >
                                        {x.cvss_score}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Paper>
                              </Grid>
                            ))}
                          </div>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}
      </div>
    );
  };

  return <Container />;
};

export default VulnCards;
