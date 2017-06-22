const request = require("supertest");
const expect = require("expect");
const app = require("../server");
const Todo = require("../models/todo");
const { ObjectID } = require("mongodb");

const todos = [
  {
    text: "First todo",
    _id: new ObjectID()
  },
  {
    text: "second",
    _id: new ObjectID()
  }
];

beforeEach(done => {
  Todo.remove({}, err => {
    if (!err) {
      return Todo.insertMany(todos, err => {
        if (!err) {
          return done();
        }
      });
    }
  });
});
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
});
