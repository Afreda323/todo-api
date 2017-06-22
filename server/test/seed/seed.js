const { ObjectID } = require("mongodb");
const Todo = require("../../models/todo");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");

const u1Id = new ObjectID();
const u2Id = new ObjectID();

const users = [
  {
    _id: u1Id,
    email: "ayy@lol.com",
    password: "abc123",
    tokens: [
      {
        access: "auth",
        token: jwt.sign({ _id: u1Id, access: "auth" }, process.env.JWT_SECRET).toString()
      }
    ]
  },
  {
    _id: u2Id,
    email: "ayy2@lol.com",
    password: "abc123",
    tokens: [
      {
        access: "auth",
        token: jwt.sign({ _id: u2Id, access: "auth" }, process.env.JWT_SECRET).toString()
      }
    ]
  }
];

const todos = [
  {
    text: "First todo",
    _id: new ObjectID(),
    _creator: u1Id
  },
  {
    text: "second",
    _id: new ObjectID(),
    completed: true,
    completedAt: 333,
    _creator: u2Id
  }
];
const populate = done => {
  Todo.remove({}, err => {
    if (!err) {
      return Todo.insertMany(todos, err => {
        if (!err) {
          return done();
        }
      });
    }
  });
};
const populateUsers = done => {
  User.remove({}).then(() => {
      const userOne = new User(users[0]).save();
      const userTwo = new User(users[1]).save();
      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

module.exports = { todos, populate, populateUsers, users };
