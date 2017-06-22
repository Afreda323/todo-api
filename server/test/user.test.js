const request = require("supertest");
const expect = require("expect");
const app = require("../server");
const Todo = require("../models/todo");
const User = require("../models/user");
const { ObjectID } = require("mongodb");

const { populate, todos, populateUsers, users } = require("./seed/seed");

beforeEach(populateUsers);

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
              expect(user.tokens[1]).toInclude({
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
