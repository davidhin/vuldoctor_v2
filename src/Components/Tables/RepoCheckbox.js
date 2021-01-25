import Checkbox from "@material-ui/core/Checkbox";
import axios from "axios";
import React, { useEffect, useState } from "react";
import short from "short-uuid";

// This is essentially a checkbox with loaded functionality and state.
// "UpdateProject" is used for updating the projects table
const GHRepo = (props) => {
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [header, setHeader] = useState(props.header);
  const [repoProject, setRepoProject] = useState(props.repoProject);

  useEffect(() => {
    setHeader(header);
    setRepoProject(props.repoProject);
    if (props.repoProject) {
      setChecked(props.repoProject.checked);
    }
  }, [props.header, props.repoProject]);

  // Runs when the checkbox is clicked
  const handleChange = async (event) => {
    let target_checked = event.target.checked;
    let projectID = short.generate();
    axios.post(
      "/addGitHubProject",
      {
        pid: projectID,
        repoid: props.repo.id,
        reponame: props.repo.full_name,
        checked: target_checked,
      },
      header
    );
    setChecked(target_checked);
  };

  // Return a material-ui checkbox
  return (
    <Checkbox
      style={{ padding: 0 }}
      disabled={disabled}
      checked={checked}
      onChange={handleChange}
      inputProps={{ "aria-label": "primary checkbox" }}
    />
  );
};
export default GHRepo;
