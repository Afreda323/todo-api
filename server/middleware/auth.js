const User = require("../models/user");

const requireAuth = (req, res, next) => {
  const token = req.header("x-auth");
  User.findByToken(token)
    .then(user => {
      if (!user) {
        return Promise.reject();
      }
      req.user = user;
      req.token = token;
      next();
    })
    .catch(e => {
      res.status(401).json({ error: "Unauthorized" });
    });
};

module.exports = requireAuth;
