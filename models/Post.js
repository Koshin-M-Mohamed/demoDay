const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  image: {
    type: String,
  },
  cloudinaryId: {
    type: String,
  },
  postText: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },
  stars: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userName: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Post", PostSchema);
