// components/session/Login.jsx
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";
import { Alert } from "@material-ui/lab";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import fire from "../../fire.js";

const PasswordReset = (props) => {
  const [email, setEmail] = useState();
  const [error, setError] = useState(null);
  const [severity, setSeverity] = useState("error");

  const handleSubmit = (e) => {
    e.preventDefault();
    fire
      .auth()
      .sendPasswordResetEmail(email)
      .then((e) => {
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
      <Typography variant="h5" style={{ marginBottom: "32px" }}>
        Reset Password
      </Typography>
      <TextField
        onChange={({ target }) => setEmail(target.value)}
        label="Email"
        fullWidth
        style={{ marginBottom: "48px" }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        style={{ float: "right" }}
      >
        Send reset link
      </Button>
      <Link
        component="button"
        variant="body2"
        component={RouterLink}
        to="/login"
      >
        Sign In
      </Link>
    </form>
  );
};
export default PasswordReset;
