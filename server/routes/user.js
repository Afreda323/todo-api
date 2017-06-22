const router = require("express").Router();

//  Model Import
const User = require("../models/user");
router.post("/", (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    User.find({ email }).then(exists => {
      if (exists) {
        return res.status(400).json({ error: "User exists" });
      }
      const user = new User({
        email,
        password
      });
      user
        .save()
        .then(user => {
          return user.generateAuthToken();
        })
        .then(token => {
          res.header("x-auth", token).json({ user });
        })
        .catch(e => res.status(400).json({ error: "Something went wrong" }));
    }).catch(err => console.log(err));
  } else {
    return res.status(400).json({ error: "Provide email and password" });
  }
});

module.exports = router;
