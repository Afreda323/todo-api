const request = require("supertest");
const expect = require("expect");
const app = require("../server");
const Todo = require("../models/todo");

const todos = [
  {
    text: "First todo"
  },
  {
    text: "second"
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
          expect(res.body.text).toBe(text);
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
});
