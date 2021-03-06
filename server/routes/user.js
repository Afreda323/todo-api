const router = require("express").Router();

//  Model Import
const User = require("../models/user");
const requireAuth = require("../middleware/auth");
router.post("/", (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
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
      .catch(e => {
        res.status(400).json({ error: "Something went wrong" });
      });
  } else {
    return res.status(400).json({ error: "Provide email and password" });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findByCredentials(email, password, (err, user) => {
      if(err){
          return res.status(400).json({error: err})
      }
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).json({ user });
      })
  })
});

router.delete('/me/token', requireAuth,  (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send()
    })
})

module.exports = router;
