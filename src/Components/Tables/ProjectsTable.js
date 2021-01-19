import MaterialTable from "material-table";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { TABLEICONS } from "./tableIcons";

const ProjectsTable = (props) => {
  const [data, setData] = useState([]);
  const history = useHistory();

  useEffect(() => {
    setData(props.projects);
  });

  return (
    <div style={{ maxWidth: "100%" }}>
      <MaterialTable
        icons={TABLEICONS}
        columns={[
          { title: "Project ID", field: "pid" },
          { title: "Project Name", field: "name" },
          { title: "Status", field: "status" },
        ]}
        data={data}
        title="Projects"
        options={{
          pageSize: 10,
          pageSizeOptions: [10, 20, 50],
        }}
        isLoading={props.loading}
        actions={[
          {
            icon: "v",
            tooltip: "View Project",
            onClick: (event, row) => history.push(`/report/${row.pid}`),
          },
        ]}
      />
    </div>
  );
};

export default ProjectsTable;
