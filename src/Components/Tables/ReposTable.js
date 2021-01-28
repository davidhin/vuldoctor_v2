// https://github.com/mbrn/material-table
import MaterialTable from "@material-table/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "@material-ui/lab/Alert";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { createToken } from "../Authentication";
import RepoCheckbox from "./RepoCheckbox";
import { TABLEICONS } from "./tableIcons";

const clientID = "3cb850ce6db515368334";
const githubScope = "repo%20user:email%20admin:repo_hook";
const githubParams = `&scope=${githubScope}&client_id=${clientID}`;
const githubAuth = `https://github.com/login/oauth/authorize?${githubParams}`;
const OAuth = `https://github.com/settings/connections/applications/${clientID}`;

// This is a material-ui table that is used in the GitHub page
// The table has 3 columns: Repository, Files and "Add to Projects"
// The content of the table is grabbed from the User's Linked GH account

const ReposTable = (props) => {
  const units = {
    Bytes: 1,
    KB: 10 ** 3,
    MB: 10 ** 6,
    GB: 10 ** 9,
    TB: 10 ** 12,
  };
  let location = useLocation();
  const [ghtoken, setGHtoken] = useState(null);
  const [data, setData] = useState([]);
  const [infobox, setInfobox] = useState(false);
  const [loading, setLoading] = useState(true);

  // Usage
  // formatBytes(bytes,decimals)
  // formatBytes(1024);       // 1 KB
  // formatBytes('1024');     // 1 KB
  // formatBytes(1234);       // 1.21 KB
  // formatBytes(1234, 3);    // 1.205 KB
  // https://stackoverflow.com/questions/15900485
  const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    let ret = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    return ret;
  };

  // Reverse formatBytes for custom sorting
  const parseSize = (s) => {
    let str = s.toString().split(" ");
    return parseInt(parseFloat(str[0]) * units[str[1]]);
  };

  useEffect(() => {
    if (props.user) {
      let code = location.search.match(/\?code=(.*)/);

      const getRepositories = async (ghtoken) => {
        // Send request to GitHub and get repos
        let header = await createToken(props.user);
        let repos = await fetch("https://api.github.com/user/repos", {
          headers: { Authorization: "token " + ghtoken },
        })
          .then((res) => res.json())
          .then(async (res) => {
            if (res["message"] === "Bad credentials") {
              await axios.post("/gh", { ghtoken: null }, header);
              return;
            }
            Object.keys(res).map((k) => {
              if (!res[k]["size"]) res[k]["size"] = 0;
              res[k]["size"] = formatBytes(res[k]["size"] * 1024);
              res[k]["add"] = (
                <RepoCheckbox
                  repo={res[k]}
                  header={header}
                  repoProject={props.repoProjects[res[k].id]}
                />
              );
            });
            return res;
          });
        setData(repos);
        setLoading(false);
      };

      // Get code from URL parameter
      // Get access token
      // useCallback https://stackoverflow.com/questions/53332321
      const getGHToken = async (code) => {
        let header = await createToken(props.user);
        let gh_token = await axios.get("/gh", header);
        if (!gh_token.data) {
          const cors_auth = "https://vuldoctorgk.herokuapp.com/authenticate/";
          let res = await fetch(`${cors_auth}${code[1]}`);
          res = await res.json();
          const token = res.token;
          setGHtoken(token);
          getRepositories(token);
          await axios.post("/gh", { ghtoken: token }, header);
        } else {
          setGHtoken(gh_token.data);
          getRepositories(gh_token.data);
        }
      };

      // If ghtoken is already present
      const loadGHData = async () => {
        let header = await createToken(props.user);
        let gh_token = await axios.get("/gh", header);
        if (gh_token.data) {
          setGHtoken(gh_token.data);
          getRepositories(gh_token.data);
        } else {
          setLoading(false);
        }
      };

      if (code) {
        setInfobox(true);
        getGHToken(code);
      } else {
        loadGHData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: "100%" }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          {!infobox ? null : (
            <div>
              <Alert severity="info" elevation={3}>
                You've linked your GitHub! Be patient, as it may take up to 5
                minutes for VulDoctor to connect with your account. If your
                repositories are not showing up, try refreshing the page.
              </Alert>
              <br />
            </div>
          )}
          {ghtoken ? (
            <div className="button-right">
              <Button variant="contained" color="primary" href={OAuth}>
                View GitHub Access Privileges
              </Button>
            </div>
          ) : (
            <div>
              <Button variant="contained" color="primary" href={githubAuth}>
                Sign Into Github
              </Button>
            </div>
          )}
          <br />
          <MaterialTable
            icons={TABLEICONS}
            columns={[
              { title: "Repository", field: "full_name" },
              {
                title: "Size",
                field: "size",
                customSort: (a, b) => parseSize(a.size) - parseSize(b.size),
              },
              { title: "Private", field: "private" },
              { title: "Add to Projects", field: "add" },
            ]}
            data={data}
            title="Repositories"
            options={{
              pageSize: 10,
              pageSizeOptions: [10, 20, 50],
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ReposTable;
