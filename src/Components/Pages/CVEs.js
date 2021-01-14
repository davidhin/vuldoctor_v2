import axios from "axios";
import queryString from "query-string";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const CVEs = (props) => {
  let location = useLocation();
  let changePage = props.changePage;

  useEffect(() => {
    changePage("CVE Search");
    const search = queryString.parse(location.search)["search"];
    const getEntries = async () => {
      let results = await axios.get("/search/cve?search=" + search);
      console.log(results);
    };
    if (typeof search !== "undefined") {
      getEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div></div>;
};

export default CVEs;
