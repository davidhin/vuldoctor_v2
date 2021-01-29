import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createToken } from "../Authentication";
import HistoryCards from "../Report/HistoryCards";

function History(props) {
  let user = props.user;
  let { projectid } = useParams();
  const [loading, setLoading] = useState(true);
  const [hist, setHist] = useState(null);

  useEffect(() => {
    props.changePage(`History - ${projectid}`);
    const getHistoryData = async () => {
      const header = await createToken(user);
      const res = await axios.get(`/getHistory/${projectid}`, header);
      setHist(res["data"]);
      setLoading(false);
    };
    getHistoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {loading || !hist ? (
        <CircularProgress />
      ) : (
        <div>
          {hist.map((x) => (
            <HistoryCards hist={x.vulns} notifydate={x.date} />
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
