import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Application from "./Components/Application";
import fire from "./fire.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  fire.auth().onAuthStateChanged((user) => {
    return user ? setIsLoggedIn(true) : setIsLoggedIn(false);
  });

  return (
    <Router>
      <Application isLoggedIn={isLoggedIn} />
    </Router>
  );
}
export default App;
