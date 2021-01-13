import axios from "axios";
import React from "react";

function Home() {
  const ping_test = () => {
    axios.get("/ping").then((response) => {
      console.log(response);
    });
  };

  return (
    <div>
      <button onClick={ping_test}>CLICK ME</button>
    </div>
  );
}

export default Home;
