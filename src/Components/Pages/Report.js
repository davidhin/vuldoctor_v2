import CircularProgress from "@material-ui/core/CircularProgress";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReportData from "../Report/ReportData";

const Report = (props) => {
  let changePage = props.changePage;
  let user = props.user;
  let { projectid } = useParams();

  useEffect(() => {
    changePage("Report");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {!user ? (
        <CircularProgress />
      ) : (
        <ReportData user={props.user} projectid={projectid} />
      )}
    </div>
  );
};

export default Report;
