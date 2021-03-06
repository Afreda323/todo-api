const router = require("express").Router();
const { ObjectID } = require("mongodb");
const _ = require("lodash");
//  Model Import
const Todo = require("../models/todo");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

router.post("/", (req, res) => {
  if (req.body.text) {
    const todo = new Todo({
      text: req.body.text,
      _creator: req.user._id
    });
    todo
      .save()
      .then(todo => res.json({ todo }))
      .catch(e => res.status(400).send({ error: "Somehting went wrong" }));
  } else {
    res.status(400).send({ error: "Please send some text" });
  }
});

router.get("/", (req, res) => {
  Todo.find({ _creator: req.user._id }, { __v: 0 })
    .then(todos => res.json({ todos }))
    .catch(err => res.status(400).send({ err: "Smething went wrong" }));
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }
  Todo.findOne({ _id: id, _creator: req.user._id })
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ error: "Todo doesnt exist" });
      }
      res.json({ todo });
    })
    .catch(err => res.status(400).json({ error: "There was a problem" }));
});
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }
  Todo.findOneAndRemove({ _id: id, _creator: req.user._id })
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ error: "Doesnt exist" });
      }
      res.json({ todo });
    })
    .catch(err => res.status(400).json({ error: "There was a problem" }));
});

router.patch("/:id", (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ["text", "completed"]);
  if (!ObjectID.isValid(id)) {
    res.status(404).json({ error: "Invalid ID" });
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate(
    {
      _id: id,
      _creator: req.user._id
    },
    {
      $set: body
    },
    {
      new: true
    }
  )
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ error: "Doesnt Exist" });
      }
      res.json({ todo });
    })
    .catch(e => res.status(400).json({ error: "Something went wrong" }));
});

module.exports = router;
