// components/session/Login.jsx
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import { Alert } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import fire from "../../fire.js";

const VerifyEmail = (props) => {
  const [error, setError] = useState(null);
  const [severity, setSeverity] = useState("error");

  useEffect(() => {
    props.user.sendEmailVerification();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    props.user
      .sendEmailVerification()
      .then(() => {
        setError("A link has been sent to your email.");
        setSeverity("success");
      })
      .catch((error) => {
        setError(error.message);
        setSeverity("error");
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error !== null && (
        <Alert severity={severity} style={{ marginBottom: "24px" }}>
          {error}
        </Alert>
      )}
      <Typography variant="h6" style={{ marginBottom: "32px" }}>
        We have sent an email with a confirmation link to your email address,
        <span style={{ color: "rgb(0, 150, 136)" }}>
          {" " + props.user.email}
        </span>
        . Please allow 5-10 minutes for this message to arrive.
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        style={{ marginBottom: "32px" }}
      >
        Please refresh this page once you've verified your email.
      </Typography>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        style={{ float: "right" }}
      >
        Re-send verification email
      </Button>
      <Link
        component="button"
        variant="body2"
        component={RouterLink}
        onClick={() => fire.auth().signOut()}
      >
        Sign out
      </Link>
    </form>
  );
};
export default VerifyEmail;
