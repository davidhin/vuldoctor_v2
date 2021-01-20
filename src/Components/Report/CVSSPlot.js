import React, { useEffect, useState } from "react";

const CVSSPlot = (props) => {
  const [scan, setScan] = useState(props.scan);

  useEffect(() => {
    setScan(props.scan);
    console.log(scan);
  }, [props.scan]);

  return <div></div>;
};

export default CVSSPlot;
