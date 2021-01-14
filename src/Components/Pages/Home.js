import axios from "axios";
import React, { useEffect, useState } from "react";
import { createToken } from "../Authentication";

function Home(props) {
  const [name, setName] = useState();

  useEffect(() => {
    props.changePage("Home");
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`submitted: ${name} `);
    const header = await createToken();
    try {
      const payload = { name };
      axios.post("/ping", payload, header);
    } catch (e) {
      console.error(e);
    }
  };

  const getEntries = async () => {
    const header = await createToken();
    try {
      const res = await axios.get("/ping", header);
      console.log(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          onChange={({ target }) => setName(target.value)}
        />
        <br />
        <button type="submit">Submit</button>
      </form>
      <button onClick={getEntries}>GetEntries</button>
    </div>
  );
}

export default Home;
