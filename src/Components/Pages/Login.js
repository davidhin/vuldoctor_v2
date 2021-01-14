// components/session/Login.jsx
import React, { useEffect, useState } from "react";
import fire from "../../fire.js";

const Login = (props) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  useEffect(() => {
    props.changePage("Login");
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    fire
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((error) => {
        console.error("Incorrect username or password");
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={({ target }) => setEmail(target.value)}
          placeholder="Email"
        />
        <br />
        <input
          type="password"
          onChange={({ target }) => setPassword(target.value)}
          placeholder="Password"
        />
        <br />
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
};
export default Login;
