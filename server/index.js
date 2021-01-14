const path = require("path");
const express = require("express");
const cors = require("cors");
const app = express(); // create express app
const mongoose = require("mongoose");
const decodeIDToken = require("./authenticateToken");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const { MONGODB_TOKEN } = process.env;

var routes = require("./routes");

// add middleware - react
app.use(express.static(path.join(__dirname, "..", "build")));

// json middleware
app.use(express.json());

// cors
app.use(cors());

// for token authentication
app.use(decodeIDToken);

// https://medium.com/javascript-in-plain-english/805c83e4dadd
// https://medium.com/@adostes/ac3b6c307373
// connect to mongo db atlas database
mongoose
  .connect(MONGODB_TOKEN, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("Error connecting to DB", err.message);
  });

// https://stackoverflow.com/questions/35749288
// use routes
app.use("/", routes);

// https://levelup.gitconnected.com/a428ec4dfe2b
// serve the build folder that will be created by create-react-app
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

// start express server on port 5000
console.log(process.env);
console.log(process.env.PORT);
app.listen(process.env.PORT || 5000);
