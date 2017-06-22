const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcrypt");
//===========
//   USER
//===========
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    minlength: 1,
    trim: true,
    required: true,
    validate: {
      isAsync: true,
      validator: validator.isEmail,
      message: "{Value} is not a valid email"
    }
  },
  password: {
    type: String,
    minlength: 6,
    required: true
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});
userSchema.methods.toJSON = function() {
  let user = this;
  let userObj = user.toObject();
  return _.pick(userObj, ["_id", "email"]);
};
userSchema.methods.generateAuthToken = function() {
  let user = this;
  const access = "auth";
  const token = jwt
    .sign({ _id: user._id.toHexString(), access }, "AYYY")
    .toString();
  user.tokens.push({
    access,
    token
  });

  return user.save().then(() => {
    return token;
  });
};
userSchema.statics.findByToken = function(token) {
  const User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, "AYYY");
  } catch (e) {
    return Promise.reject();
  }
  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};
userSchema.pre("save", function(next) {
  const user = this;
  if (user.isModified("password")) {
    bcrypt.hash(user.password, 10, function(err, hash) {
      user.password = hash;
      next();
    });
  } else {
    next();
  }
});
const User = mongoose.model("User", userSchema);

module.exports = User;
