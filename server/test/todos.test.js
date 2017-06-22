const request = require("supertest");
const expect = require("expect");
const app = require("../server");
const Todo = require("../models/todo");
const { ObjectID } = require("mongodb");

const { populate, todos, populateUsers, users } = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populate);

describe("TODO Routes", () => {
  describe("POST /todos", () => {
    it("Should create a new todo", done => {
      const text = "Test TODO";
      request(app)
        .post("/todos")
        .set("x-auth", users[0].tokens[0].token)
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
      request(app)
        .post("/todos")
        .set("x-auth", users[0].tokens[0].token)
        .send(text)
        .expect(400)
        .end((e, res) => {
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
        .set("x-auth", users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body.todos.length).toBe(1);
        })
        .end(done);
    });
  });
  describe("GET /todos/:id", () => {
    it("Should return a todo", done => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set("x-auth", users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });
    it("Should not return a todo", done => {
      request(app)
        .get(`/todos/${todos[1]._id.toHexString()}`)
        .set("x-auth", users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
    it("should return 404 if not found", done => {
      const fake = new ObjectID().toHexString();
      request(app)
        .get(`/todos/${fake}`)
        .set("x-auth", users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
    it("should return 404 if invalid ID", done => {
      request(app)
        .get(`/todos/123`)
        .set("x-auth", users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
  });
  describe("DELETE /todos/:id", done => {
    it("Should remove a todo", done => {
      const hexID = todos[0]._id.toHexString();
      request(app)
        .delete(`/todos/${hexID}`)
        .set("x-auth", users[0].tokens[0].token)
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
      request(app)
        .delete(`/todos/${fake}`)
        .set("x-auth", users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
    it("should return 404 if invalid ID", done => {
      request(app)
        .delete(`/todos/123`)
        .set("x-auth", users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
  });
  describe("PATCH /todos/:id", () => {
    it("Should Update TODO", done => {
      const hexID = todos[0]._id.toHexString();
      request(app)
        .patch(`/todos/${hexID}`)
        .set("x-auth", users[0].tokens[0].token)
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
    it("Should not Update other user's TODO", done => {
      const hexID = todos[0]._id.toHexString();
      request(app)
        .patch(`/todos/${hexID}`)
        .send({
          text: "update",
          completed: true
        })
        .expect(401)
        .end(done);
    });
    it("Should clear completedAt when todo isnt complete", done => {
      const hexID2 = todos[1]._id.toHexString();
      request(app)
        .patch(`/todos/${hexID2}`)
        .set("x-auth", users[1].tokens[0].token)
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
