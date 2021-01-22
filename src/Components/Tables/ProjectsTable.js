import MaterialTable from "material-table";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { TABLEICONS } from "./tableIcons";

const ProjectsTable = (props) => {
  const [data, setData] = useState([]);
  const history = useHistory();

  useEffect(() => {
    setData(props.projects);
  }, [props.projects]);

  return (
    <div style={{ maxWidth: "100%" }}>
      <MaterialTable
        icons={TABLEICONS}
        columns={[
          { title: "Project ID", field: "pid", editable: "never" },
          { title: "Project Name", field: "name", editable: "onUpdate" },
          { title: "Status", field: "status", editable: "never" },
        ]}
        data={data}
        title="Projects"
        options={{
          pageSize: 10,
          pageSizeOptions: [10, 20, 50],
        }}
        isLoading={props.loading}
        editable={{
          isDeletable: (rowData) => rowData.status == "Complete",
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              const dataUpdate = [...data];
              const index = oldData.tableData.id;
              dataUpdate[index] = newData;
              setData([...dataUpdate]);
              resolve();
            }),
          onRowDelete: (oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                const dataDelete = [...data];
                const index = oldData.tableData.id;
                dataDelete.splice(index, 1);
                setData([...dataDelete]);

                resolve();
              }, 1000);
            }),
        }}
        actions={[
          (rowData) => ({
            icon: TABLEICONS.ViewProject,
            tooltip: "View Project",
            onClick: (event, row) => history.push(`/report/${row.pid}`),
            disabled: rowData.status != "Complete",
          }),
          (rowData) => ({
            icon: TABLEICONS.Reload,
            tooltip: "Reload Report",
            onClick: (event, rowData) => console.log(rowData),
            disabled: rowData.status != "Complete",
          }),
        ]}
      />
    </div>
  );
};

export default ProjectsTable;
