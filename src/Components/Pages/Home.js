import React, { useEffect } from "react";

function Home(props) {
  useEffect(() => {
    props.changePage("Home");
  });

  return <div></div>;
}

export default Home;
