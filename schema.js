//jshint esversion:6
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectID;

const contentSchema = new mongoose.Schema({
  creatorId: ObjectId,
  creatorUsername: String,
  title: String,
  text: String,
  timestamp: Number, // May cause errors in the future when timestamp exceeds number limits.
  roomId: ObjectId,
  comments: [ObjectId]
});

const roomSchema = new mongoose.Schema({
  name: String,
  description: String,
  listOfStudents: [ObjectId],
  privacyType: String,
  accessRequests: [ObjectId],
  contents: [contentSchema]
});

const userSchema = new mongoose.Schema({
  username: String,
  googleId: String,
  outlookId: String,
  facebookId: String,
  name: String,
  country: String,
  course: String,
  room: [roomSchema]
});

const commentSchema = new mongoose.Schema({
  creatorId: ObjectId,
  contentId: ObjectId,
  numOfLikes: Number,
  text: String,
});

const likeSchema = new mongoose.Schema({
  userId: ObjectId,
  contentId: ObjectId
})

exports.userSchema = userSchema;
exports.roomSchema = roomSchema;
exports.contentSchema = contentSchema;
exports.commentSchema = commentSchema;
