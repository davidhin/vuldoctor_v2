import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createToken } from "../Authentication";
import ReportData from "../Report/ReportData";

const Report = (props) => {
  let changePage = props.changePage;
  let user = props.user;
  let { projectid } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    changePage("Report");
    const getReportData = async () => {
      const header = await createToken(props.user);
      const res = await axios.get(`/getreport/${projectid}`, header);
      console.log(res);
      setLoading(false);
    };
    getReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>{loading ? <CircularProgress /> : <ReportData />}</div>;
};

export default Report;
