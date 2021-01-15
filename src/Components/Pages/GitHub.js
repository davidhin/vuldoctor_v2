import CircularProgress from "@material-ui/core/CircularProgress";
import React, { useEffect } from "react";
import ReposTable from "../Tables/ReposTable";

const GitHub = (props) => {
  let changePage = props.changePage;
  let user = props.user;

  useEffect(() => {
    changePage("GitHub");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>{!user ? <CircularProgress /> : <ReposTable user={props.user} />}</div>
  );
};

export default GitHub;
