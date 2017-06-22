require("./config");
const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");
const mongoose = require("./db/mongoose");

//=============
//  Route Import
//=============
const userRoute = require("./routes/user");
const todoRoute = require("./routes/todos");

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/users", userRoute);
app.use("/todos", todoRoute);

app.listen(port, () => {
  console.log(`Up on Port:${port} brah`);
});

module.exports = app;
