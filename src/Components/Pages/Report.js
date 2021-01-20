import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createToken } from "../Authentication";
import CVSSPlot from "../Report/CVSSPlot";

const Report = (props) => {
  let changePage = props.changePage;
  let user = props.user;
  let { projectid } = useParams();
  const [loading, setLoading] = useState(true);
  const [bom, setBom] = useState(null);
  const [deps, setDeps] = useState(null);
  const [scan, setScan] = useState(null);

  useEffect(() => {
    changePage("Report");
    const getReportData = async () => {
      const header = await createToken(user);
      const res = await axios.get(`/getreport/${projectid}`, header);
      setBom(res["data"]["bom"]);
      setDeps(res["data"]["deps"]);
      setScan(res["data"]["scan"]);
      setLoading(false);
    };
    getReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>{loading ? <CircularProgress /> : <CVSSPlot scan={deps} />}</div>;
};

export default Report;
