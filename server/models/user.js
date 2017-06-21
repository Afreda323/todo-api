const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
//===========
//   USER
//===========
const userSchema = new Schema({
  email: {
    type: String,
    minlength: 1,
    trim: true,
    required: true
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;