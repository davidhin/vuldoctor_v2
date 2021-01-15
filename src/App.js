import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Application from "./Components/Application";
import fire from "./fire.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [user, setUser] = useState(null);

  fire.auth().onAuthStateChanged((user) => {
    setUser(user);
    return user ? setIsLoggedIn(true) : setIsLoggedIn(false);
  });

  return (
    <Router>
      <Application isLoggedIn={isLoggedIn} user={user} />
    </Router>
  );
}
export default App;
