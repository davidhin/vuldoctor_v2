import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { createToken } from "../Authentication";
import ReposTable from "../Tables/ReposTable";

const GitHub = (props) => {
  let changePage = props.changePage;
  let user = props.user;
  const [repoProjects, setRepoProjects] = useState(null);

  useEffect(() => {
    changePage("GitHub");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getProjects = async () => {
      const header = await createToken(props.user);
      let res = await axios.get("/getProjects", header);
      let repo_projects = {};
      res["data"].forEach((x) => {
        if (x.repoid) {
          repo_projects[x.repoid] = x;
        }
      });
      setRepoProjects(repo_projects);
    };
    getProjects();
  }, []);

  return (
    <div>
      {!user || !repoProjects ? (
        <CircularProgress />
      ) : (
        <ReposTable user={props.user} repoProjects={repoProjects} />
      )}
    </div>
  );
};

export default GitHub;
