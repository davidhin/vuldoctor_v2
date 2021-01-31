// components/session/Login.jsx
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";
import { Alert } from "@material-ui/lab";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import fire from "../../fire.js";

const SignUp = (props) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [passwordconfirm, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password != passwordconfirm) {
      setError("Passwords do not match!");
      return;
    }
    fire
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error !== null && (
        <Alert severity="error" style={{ marginBottom: "24px" }}>
          {error}
        </Alert>
      )}
      <Typography variant="h5" style={{ marginBottom: "32px" }}>
        Sign Up
      </Typography>
      <TextField
        onChange={({ target }) => setEmail(target.value)}
        label="Email"
        fullWidth
        style={{ marginBottom: "32px" }}
      />
      <TextField
        type="password"
        onChange={({ target }) => setPassword(target.value)}
        label="Password"
        fullWidth
        style={{ marginBottom: "32px" }}
      />
      <TextField
        type="password"
        onChange={({ target }) => setConfirmPassword(target.value)}
        label="Confirm Password"
        fullWidth
        style={{ marginBottom: "48px" }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        style={{ float: "right" }}
      >
        Sign Up
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
export default SignUp;
