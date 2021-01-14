import React, { useEffect } from "react";

function Dashboard(props) {
  useEffect(() => {
    props.changePage("Dashboard");
  });

  return <div></div>;
}

export default Dashboard;
