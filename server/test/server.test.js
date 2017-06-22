const request = require("supertest");
const expect = require("expect");
const app = require("../server");
const Todo = require("../models/todo");
const User = require("../models/user");
const { ObjectID } = require("mongodb");

const { populate, todos, populateUsers, users } = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populate);
//=============
//  Test
//=============
describe("TODO Routes", () => {
  describe("POST /todos", () => {
    it("Should create a new todo", done => {
      const text = "Test TODO";
      request(app)
        .post("/todos")
        .send({ text })
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe(text);
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          Todo.find({ text }, (err, todos) => {
            if (err) {
              return done(err);
            }
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          });
        });
    });

    it("Should not create invalid TODO", done => {
      const text = {};
      request(app).post("/todos").send(text).expect(400).end((e, res) => {
        if (e) {
          return done(e);
        }

        Todo.find((e, todos) => {
          if (e) {
            return done(e);
          }
          expect(todos.length).toBe(2);
          done();
        });
      });
    });
  });

  describe("GET /todos", () => {
    it("Should get all todos", done => {
      request(app)
        .get("/todos")
        .expect(200)
        .expect(res => {
          expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
  });
  describe("GET /todos/:id", () => {
    it("Should return a todo", done => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });
    it("should return 404 if not found", done => {
      const fake = new ObjectID().toHexString();
      request(app).get(`/todos/${fake}`).expect(404).end(done);
    });
    it("should return 404 if invalid ID", done => {
      request(app).get(`/todos/123`).expect(404).end(done);
    });
  });
  describe("DELETE /todos/:id", done => {
    it("Should remove a todo", done => {
      const hexID = todos[0]._id.toHexString();
      request(app)
        .delete(`/todos/${hexID}`)
        .expect(200)
        .expect(res => {
          expect(res.body.todo._id).toBe(hexID);
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          Todo.findById(hexID)
            .then(todo => {
              expect(todo).toNotExist();
              done();
            })
            .catch(e => done(e));
        });
    });
    it("should return 404 if not found", done => {
      const fake = new ObjectID().toHexString();
      request(app).delete(`/todos/${fake}`).expect(404).end(done);
    });
    it("should return 404 if invalid ID", done => {
      request(app).delete(`/todos/123`).expect(404).end(done);
    });
  });
  describe("PATCH /todos/:id", () => {
    it("Should Update TODO", done => {
      const hexID = todos[0]._id.toHexString();
      request(app)
        .patch(`/todos/${hexID}`)
        .send({
          text: "update",
          completed: true
        })
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe("update");
          expect(res.body.todo.completed).toBe(true);
          expect(res.body.todo.completedAt).toBeA("number");
        })
        .end(done);
    });
    it("Should clear completedAt when todo isnt complete", done => {
      const hexID2 = todos[1]._id.toHexString();
      request(app)
        .patch(`/todos/${hexID2}`)
        .send({
          text: "update",
          completed: false
        })
        .expect(200)
        .expect(res => {
          expect(res.body.todo.completed).toBe(false);
          expect(res.body.todo.completedAt).toNotExist();
        })
        .end(done);
    });
  });
});

describe("USER routes", () => {
  describe("GET /user/me", () => {
    it("Should return user if auth'd", done => {
      request(app)
        .get("/users/me")
        .set("x-auth", users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body.user._id).toBe(users[0]._id.toHexString());
          expect(res.body.user.email).toBe(users[0].email);
        })
        .end(done);
    });
    it("Should return 401 if not auth'd", done => {
      request(app)
        .get("/users/me")
        .expect(401)
        .expect(res => {
          expect(res.body.user).toNotExist();
        })
        .end(done);
    });
  });
  describe("POST /users", () => {
    it("Should create a user", done => {
      const email = "lol@lolol.com";
      const password = "abc123";
      request(app)
        .post("/users")
        .send({ email, password })
        .expect(200)
        .expect(res => {
          expect(res.headers["x-auth"]).toExist();
          expect(res.body.user._id).toExist();
          expect(res.body.user.email).toBe(email);
        })
        .end(err => {
          if (err) {
            return done(err);
          }
          User.findOne({ email }).then(user => {
            expect(user).toExist();
            expect(user.password).toNotBe(password);
            done();
          });
        });
    });
    it("Should return validation errors on bad request", done => {
      request(app).post("/users").send({ email: "lol" }).expect(400).end(done);
    });
    it("Should not allow dupe user", done => {
      const email = "ayy2@lol.com";
      const password = "abc123";
      request(app)
        .post("/users")
        .send({ email, password })
        .expect(400)
        .end(done);
    });
  });
  describe("POST /users/login", () => {
    it("Should log user in and return auth token", done => {
      request(app)
        .post("/users/login")
        .send({
          email: users[1].email,
          password: users[1].password
        })
        .expect(200)
        .expect(res => {
          expect(res.headers["x-auth"]).toExist();
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          User.findById(users[1]._id)
            .then(user => {
              expect(user.tokens[0]).toInclude({
                access: "auth",
                token: res.headers["x-auth"]
              });
              done();
            })
            .catch(e => done(e));
        });
    });
    it("Should reject invalid login", done => {
      request(app)
        .post("/users/login")
        .expect(400)
        .expect(res => {
          expect(res.body.user).toNotExist();
        })
        .end(done);
    });
  });
  describe("DELETE /users/me/token", () => {
    it("Should delete token", done => {
      request(app)
        .delete("/users/me/token")
        .set("x-auth", users[0].tokens[0].token)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          User.findById(users[0]._id)
            .then(user => {
              expect(user.tokens.length).toBe(0);
              done();
            })
            .catch(e => done(e));
        });
    });
  });
});
