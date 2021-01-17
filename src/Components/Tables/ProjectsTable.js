// https://github.com/mbrn/material-table
import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";
import MaterialTable from "material-table";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { createToken } from "../Authentication";
import { TABLEICONS } from "./tableIcons";

const ProjectsTable = (props) => {
  const [data, setData] = useState([{ projectid: "1234" }]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    if (props.user) {
      const getProjects = async () => {
        const header = await createToken(props.user);
        let a = await axios.get("/getProjects", header);
        setData(a["data"]);
        setLoading(false);
      };
      getProjects();
    }
  }, []);

  return (
    <div style={{ maxWidth: "100%" }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <MaterialTable
          icons={TABLEICONS}
          columns={[
            { title: "Project ID", field: "pid" },
            { title: "Project Name", field: "name" },
          ]}
          data={data}
          title="Projects"
          options={{
            pageSize: 10,
            pageSizeOptions: [10, 20, 50],
          }}
          actions={[
            {
              icon: "v",
              tooltip: "View Project",
              onClick: (event, row) => history.push(`/report/${row.pid}`),
            },
          ]}
        />
      )}
    </div>
  );
};

export default ProjectsTable;
