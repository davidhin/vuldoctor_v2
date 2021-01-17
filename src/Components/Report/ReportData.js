import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { createToken } from "../Authentication";

const ReportData = (props) => {
  const projectid = props.projectid;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (props.user) {
      const getReportData = async () => {
        const header = await createToken(props.user);
        const res = await axios.get(`/report/${projectid}`, header);
        console.log(res);
        setLoading(false);
      };
      getReportData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>{loading ? <CircularProgress /> : <div></div>}</div>;
};

export default ReportData;
