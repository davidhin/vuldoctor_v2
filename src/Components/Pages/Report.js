import CircularProgress from "@material-ui/core/CircularProgress";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import axios from "axios";
import Fuse from "fuse.js";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createToken } from "../Authentication";
import CVSSBoxPlot from "../Report/CVSSBoxPlot";
import CVSSPlot from "../Report/CVSSPlot";
import VulnBoxes from "../Report/VulnBoxes";
import VulnCards from "../Report/VulnCards";

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

const highlight = (fuseSearchResult) => {
  const generateHighlightedText = (inputText, regions) => {
    let content = "";
    let nextUnhighlightedRegionStartingIndex = 0;
    regions.forEach((region) => {
      const lastRegionNextIndex = region[1] + 1;
      content += [
        `<span style="font-weight:300">`,
        inputText.substring(nextUnhighlightedRegionStartingIndex, region[0]),
        "</span>",
        `<span style="font-weight:800;color:"#ff1744">`,
        inputText.substring(region[0], lastRegionNextIndex),
        "</span>",
      ].join("");
      nextUnhighlightedRegionStartingIndex = lastRegionNextIndex;
    });
    content += inputText.substring(nextUnhighlightedRegionStartingIndex);
    return content;
  };
  return fuseSearchResult.map((e) => {
    let match = e["matches"][0];
    return {
      value: match.value,
      highlight: generateHighlightedText(match.value, match.indices),
    };
  });
};

const Report = (props) => {
  const classes = useStyles();
  let changePage = props.changePage;
  let user = props.user;
  let { projectid } = useParams();
  const [loading, setLoading] = useState(true);
  const [bom, setBom] = useState(null);
  const [deps, setDeps] = useState(null);
  const [scan, setScan] = useState(null);
  const [cveData, setCveData] = useState(props.scan);
  const [cweMap, setCweMap] = useState({});
  const [libMap, setLibMap] = useState(null);
  const [reqOnly, setReqOnly] = useState(null);
  const [vulns, setVulns] = useState({ HIGH: 0, MEDIUM: 0, LOW: 0 });

  useEffect(() => {
    changePage("Report");
    const initiateProject = async () => {
      const header = await createToken(user);
      const res = await axios
        .get(`/getreport/${projectid}`, header)
        .catch(() => {
          setLoading(1);
        });
      changePage("Report - " + res["data"]["projdata"]["name"]);
      setReqOnly(res["data"]["projdata"]["reqOnly"]);
    };
    initiateProject();
  }, []);

  useEffect(() => {
    const getReportData = async () => {
      const header = await createToken(user);
      let retrieved = true;
      const res = await axios
        .get(`/getreport/${projectid}`, header)
        .catch(() => {
          setLoading(1);
          retrieved = false;
        });
      if (!retrieved) {
        return;
      }
      setBom(res["data"]["bom"]);
      setScan(res["data"]["scan"]);

      if (reqOnly) {
        let required_only = [];
        res["data"]["scan"].forEach((x) => {
          if (x.package_usage == "required") {
            required_only.push(x);
          }
        });
        if (required_only.length > 0) {
          res["data"]["scan"] = required_only;
          setScan(res["data"]["scan"]);
        } else {
          res["data"]["scan"] = [{}];
          setScan(res["data"]["scan"]);
        }
      }

      // Count high/med/low vulnerabilities
      let v = {};
      v["HIGH"] = 0;
      v["MEDIUM"] = 0;
      v["LOW"] = 0;
      res["data"]["scan"].forEach((x) => {
        v[x.severity] += 1;
      });
      setVulns(v);
      v["pid"] = projectid;
      v["reqOnly"] = reqOnly;
      await axios.put("/updateProjectVulns", v, header);

      // Get dependencies to file mappings
      let rel_deps = {};
      res["data"]["deps"].forEach((x) => {
        if (x.body.length > 0) {
          let filename = x["filename"].split("/").slice(2).join("/");
          x["body"].forEach((y) => {
            if (y["name"] in rel_deps) {
              rel_deps[y["name"]].push(filename);
            } else {
              rel_deps[y["name"]] = [filename];
            }
          });
        }
      });
      setDeps(rel_deps);

      if (Object.keys(res["data"]["scan"][0]).length > 0) {
        // Get dependencies to import mappings
        var fuse = new Fuse(Object.keys(rel_deps), {
          includeMatches: true,
          includeScore: true,
          includeIndices: true,
          threshold: 0.2,
        });
        var result = {};
        res["data"]["scan"].forEach((x) => {
          let pname = x["package"].split(":")[1];
          result[pname] = highlight(fuse.search(pname));
        });
        setLibMap(result);

        // Get CVE Info
        let cve_ids = res["data"]["scan"].map((a) => a.id);
        const cveinfo = await axios.post(`/getCVEList`, cve_ids, header);
        setCveData(cveinfo["data"]);
        const cwes = {};
        Object.entries(cveinfo["data"]).forEach((e) => {
          cwes[e[1]["cve_id"]] = e[1]["problemType"];
        });
        setCweMap(cwes);
      } else {
        setScan([]);
      }

      setLoading(false);
    };
    if (reqOnly != null) {
      getReportData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reqOnly]);

  return (
    <div>
      <FormControlLabel
        disabled={loading}
        control={
          <Switch
            checked={reqOnly}
            onChange={(event) => {
              setReqOnly(event.target.checked);
              setLoading(true);
            }}
            name="checkedB"
            color="primary"
          />
        }
        label="Only show directly used dependencies"
        style={{ marginBottom: "20px" }}
      />

      {loading ? (
        <div>
          {loading === true ? (
            <CircularProgress />
          ) : (
            "Error! Project cannot be retrieved."
          )}
        </div>
      ) : (
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <VulnBoxes vulns={vulns} classes={classes} />
            </Grid>

            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Grid container spacing={2}>
                  <Grid item xs={12} lg={6}>
                    <CVSSPlot scan={scan} cveData={cveData} />
                  </Grid>
                  <Grid item xs={12} lg={6}>
                    <CVSSBoxPlot scan={scan} cveData={cveData} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <VulnCards
              cweMap={cweMap}
              bom={bom}
              scan={scan}
              cveData={cveData}
              deps={deps}
              libMap={libMap}
            />
          </Grid>
        </div>
      )}
    </div>
  );
};

export default Report;
