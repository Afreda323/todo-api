const request = require("supertest");
const expect = require("expect");
const app = require("../server");
const Todo = require("../models/todo");

beforeEach(done => {
  Todo.remove({}, err => {
    if (!err) {
      done();
    }
  });
});

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

        Todo.find((err, todos) => {
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
        expect(todos.length).toBe(0);
        done();
      });
    });
  });
});
