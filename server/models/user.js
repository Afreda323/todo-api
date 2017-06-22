const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
//===========
//   USER
//===========
const userSchema = new Schema({
  email: {
    type: String,
    minlength: 1,
    trim: true,
    required: true,
    unique: true,
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
  return _.pick(userObj, ['_id', 'email']);
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
const User = mongoose.model("User", userSchema);

module.exports = User;
