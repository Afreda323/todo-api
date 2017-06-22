const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");
const mongoose = require("./db/mongoose");

const Todo = require("./models/todo");
const User = require("./models/user");

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  if (req.body.text) {
    const todo = new Todo({
      text: req.body.text
    });
    todo
      .save()
      .then(doc => res.json(doc))
      .catch(e => res.status(400).send({ error: "Somehting went wrong" }));
  } else {
    res.status(400).send({ error: "Please send some text" });
  }
});

app.get("/todos", (req, res) => {
  Todo.find({}, { __v: 0 })
    .then(todos => res.json({ todos }))
    .catch(err => res.status(400).send({ err: "Smething went wrong" }));
});

app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }
  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ error: "Todo doesnt exist" });
      }
      res.json({ todo });
    })
    .catch(err => res.status(400).json({ error: "There was a problem" }));
});
app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid) {
    return res.status(404).json({ error: "Invalid ID" });
  }
  Todo.findByIdAndRemove(id)
    .then(doc => {
      if (!doc) {
        return res.status(404).json({ error: "Doesnt exist" });
      }
      res.json(doc);
    })
    .catch(err => res.status(400).json({ error: "There was a problem" }));
});
app.listen(port, () => {
  console.log(`Up on ${port}`);
});

module.exports = app;
