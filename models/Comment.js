const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxlength: 50, 
  },
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 300,
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", commentSchema);
