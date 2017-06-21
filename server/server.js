const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("./db/mongoose");

const Todo = require("./models/todo");
const User = require("./models/user");

const app = express();
app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  if (req.body.text) {
    const todo = new Todo({
      text: req.body.text
    });
    todo.save((e, doc) => {
      if (e) {
        res.status(400).send({ error: "Somehting went wrong" });
      } else {
        res.json(doc);
      }
    });
  } else {
    res.status(400).send({ error: "Please send some text" });
  }
});


app.listen(3000, () => {
  console.log("Up on 3000");
});


module.exports = app;