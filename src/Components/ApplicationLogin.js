// components/session/Login.jsx
import { Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Login from "./Pages/Login";
import PasswordReset from "./Pages/PasswordReset";
import SignUp from "./Pages/SignUp";
import VerifyEmail from "./Pages/VerifyEmail";

const ApplicationLogin = (props) => {
  return (
    <Grid container spacing={0}>
      <Grid item xs={12} sm={8} md={6} lg={4} xl={3}>
        <div style={{ background: "#fefefe", height: "100vh" }}>
          <div
            style={{
              top: "50%",
              position: "relative",
              "-ms-transform": "translateY(-70%)",
              transform: "translateY(-70%)",
              padding: "48px",
            }}
          >
            <Typography
              variant="h2"
              style={{
                paddingTop: "150px",
                fontWeight: 600,
                paddingBottom: "30px",
              }}
              color="primary"
            >
              VulDoctor
            </Typography>
            {props.user ? (
              <Switch>
                <Route exact path="/verifyemail">
                  <VerifyEmail user={props.user} />
                </Route>
                <Route exact path="*">
                  <Redirect to="/verifyemail" />
                </Route>
              </Switch>
            ) : (
              <Switch>
                <Route exact path="/login">
                  <Login />
                </Route>
                <Route exact path="/signup">
                  <SignUp />
                </Route>
                <Route exact path="/resetpassword">
                  <PasswordReset />
                </Route>
                <Route exact path="*">
                  <Redirect to="/login" />
                </Route>
              </Switch>
            )}
          </div>
        </div>
      </Grid>
      <Box
        component={Grid}
        item
        sm={4}
        md={6}
        lg={8}
        xl={9}
        display={{ xs: "none", sm: "block" }}
      >
        <div
          style={{
            "background-image":
              "linear-gradient(to bottom right, rgb(0, 150, 136) , rgb(244, 67, 54))",
            height: "100vh",
          }}
        ></div>
      </Box>
    </Grid>
  );
};
export default ApplicationLogin;
