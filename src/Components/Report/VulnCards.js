import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import "@progress/kendo-theme-material/dist/all.css";
import React, { useEffect, useState } from "react";
import CVEDialog from "./CVEDialog";
import ImportsDialog from "./ImportsDialog";

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
  const [scan, setScan] = useState(props.scan);
  const [cveData, setCveData] = useState(props.cveData);
  const [deps, setDeps] = useState(props.deps);
  const [bom, setBom] = useState(props.bom);
  const [cweMap, setCweMap] = useState({});
  const [libMap, setLibMap] = useState({});

  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  useEffect(() => {
    setScan(props.scan);
    setCveData(props.cveData);
    setDeps(props.deps);
    setBom(props.bom);
    setCweMap(props.cweMap);
    setLibMap(props.libMap);
  }, [
    props.scan,
    props.cveData,
    props.deps,
    props.bom,
    props.cweMap,
    props.libMap,
  ]);

  const preventDefault = (event, lib) => {
    event.preventDefault();
    window.open("https://libraries.io/" + lib);
  };

  const Container = () => {
    let cards = groupBy(scan, "package");

    return (
      <Grid item container spacing={2}>
        {Object.entries(cards).map((e) => {
          let depname = e[0].split(":")[1];
          let importname = null;
          if (libMap[depname]) {
            if (libMap[depname].length > 0) {
              importname = libMap[depname][0].value;
            }
          }
          return (
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Grid item container spacing={2}>
                  <Grid item xs={12} lg={8}>
                    <Typography
                      variant="h4"
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
                                <Typography variant="h6">{x.id}</Typography>
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
                                  CWE ID: {cweMap[x.id] ? cweMap[x.id] : "N/A"}
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

                              <Grid item xs={3} style={{ textAlign: "right" }}>
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
                  <Grid item xs={12} lg={4}>
                    <Typography variant="overline" color="textSecondary">
                      IMPORTS IN FILES
                    </Typography>
                    {importname ? (
                      <ImportsDialog
                        matches={libMap[depname]}
                        deps={deps[importname]}
                      />
                    ) : null}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return <Container />;
};

export default VulnCards;
