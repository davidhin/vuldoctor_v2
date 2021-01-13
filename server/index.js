const path = require("path");
const express = require("express");
const app = express(); // create express app

// add middleware - react
app.use(express.static(path.join(__dirname, "..", "build")));

// Test send
app.get("/ping", (req, res) => {
  console.log("PONG");
  res.json({test:"PONG"})
});

// https://levelup.gitconnected.com/a428ec4dfe2b
// serve the build folder that will be created by create-react-app
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

// start express server on port 5000
app.listen(5000, () => {
  console.log("server started on port 5000");
});
