import "@progress/kendo-theme-material/dist/all.css";
import React, { useEffect, useState } from "react";

const CVSSPlot = (props) => {
  const [scan, setScan] = useState(props.scan);
  const [cveData, setCveData] = useState(props.cveData);
  const [plotData, setPlotData] = useState(null);

  useEffect(() => {
    setScan(props.scan);
    setCveData(props.cveData);
  }, [props.scan, props.cveData]);

  const ChartContainer = () => <div></div>;

  return <ChartContainer />;
};

export default CVSSPlot;
