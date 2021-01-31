import CircularProgress from "@material-ui/core/CircularProgress";
import { MuiThemeProvider } from "@material-ui/core/styles";
import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Application from "./Components/Application";
import ApplicationLogin from "./Components/ApplicationLogin";
import VDTheme from "./Components/Theme";
import fire from "./fire.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [user, setUser] = useState(null);

  fire.auth().onAuthStateChanged((user) => {
    setUser(user);
    return user ? setIsLoggedIn(true) : setIsLoggedIn(false);
  });

  return (
    <MuiThemeProvider theme={VDTheme}>
      {isLoggedIn === null ? (
        <CircularProgress />
      ) : (
        <div>
          {isLoggedIn === false || (user && !user.emailVerified) ? (
            <Router>
              <ApplicationLogin user={user} />
            </Router>
          ) : (
            <Router>
              <Application isLoggedIn={isLoggedIn} user={user} />
            </Router>
          )}
        </div>
      )}
    </MuiThemeProvider>
  );
}
export default App;
