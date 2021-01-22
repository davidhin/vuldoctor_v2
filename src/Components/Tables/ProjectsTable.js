import axios from "axios";
import MaterialTable from "material-table";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { TABLEICONS } from "./tableIcons";

const ProjectsTable = (props) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    setData(props.projects);
    setLoading(props.loading);
  }, [props.projects, props.loading]);

  return (
    <div style={{ maxWidth: "100%" }}>
      <MaterialTable
        icons={TABLEICONS}
        columns={[
          { title: "Project Name", field: "name", editable: "onUpdate" },
          { title: "Status", field: "status", editable: "never" },
        ]}
        data={data}
        title="Projects"
        options={{
          pageSize: 10,
          pageSizeOptions: [10, 20, 50],
        }}
        isLoading={loading}
        editable={{
          isDeletable: (rowData) => rowData.status === "Complete",
          onRowUpdate: async (newData, oldData) => {
            const dataUpdate = [...data];
            dataUpdate[oldData.tableData.id] = newData;
            setData([...dataUpdate]);
            await axios.put("/updateProjectName", newData, props.auth_header);
          },
          onRowDelete: async (oldData) => {
            const dataDelete = [...data];
            dataDelete.splice(oldData.tableData.id, 1);
            setData([...dataDelete]);
            await axios.delete("/deleteProject", {
              data: oldData,
              headers: props.auth_header["headers"],
            });
          },
        }}
        actions={[
          (rowData) => ({
            icon: TABLEICONS.ViewProject,
            tooltip: "View Project",
            onClick: (event, row) => history.push(`/report/${row.pid}`),
            disabled: rowData.status !== "Complete",
          }),
          (rowData) => ({
            icon: TABLEICONS.Reload,
            tooltip: "Reload Report",
            onClick: (event, rowData) => console.log(rowData),
            disabled: rowData.status !== "Complete",
          }),
        ]}
      />
    </div>
  );
};

export default ProjectsTable;
