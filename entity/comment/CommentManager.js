"use strict";
// jshint esversion:6

const mongoose = require("mongoose");
const commentSchema = require('../../schema').commentSchema;
const Comment = new mongoose.model('Comment', commentSchema);
const GoogleFileStorageManager =
    require("../../fileStorage/managerTypes/GoogleFileStorageManager");

/**
 * This class is responsible for handling comments data in the database
 * for CRUD operations.
 */
class CommentManager {

  static INITIAL_NUM_OF_LIKES = 0;
  static ACTION_STATUS = {
    SUCCESS: 'success',
    FAILED: 'failed'
  }

  async createComment(commentObject) {
    const createdComment =
        await Comment.create({
          creatorId: commentObject.creatorId,
          contentId: commentObject.contentId,
          numOfLikes: commentObject.numOfLikes,
          text: commentObject.text,
          likersId: commentObject.likersId
        });
    return createdComment;
  }

  async deleteComment(commentId) {
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    return deletedComment;
  }

  async toggleCommentLike(commentId, userId) {
    const comment = await Comment.findOne({_id: commentId});
    let updatedComment;
    if (!comment.likersId.includes(userId)) {
      updatedComment =
          await Comment.updateOne(
            {_id: comment._id}, {$push: {likersId: userId}});
    } else {
      updatedComment =
          await Comment.updateOne(
            {_id: comment._id}, {$pull: {likersId: userId}});
    }
    return updatedComment;
  }

  async getCommentsFromOneContent(content) {
    const foundComments = await Comment.find({contentId: content._id});
    return foundComments;
  }

  async getCommentsFromContents(contents) {
    const promises = [];
    for (let i = 0; i < contents.length; i++) {

    }
    const foundComments = await Promise.all(promises);
    return foundComments;
  }
}

export default CommentManager;
