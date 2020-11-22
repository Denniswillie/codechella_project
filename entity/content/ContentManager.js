"use strict";
// jshint esversion:6

const mongoose = require("mongoose");
const contentSchema = require('../../schema').contentSchema;
const Content = new mongoose.model('Content', contentSchema);
const GoogleFileStorageManager =
    require("../../fileStorage/managerTypes/GoogleFileStorageManager");

/**
 * This class is responsible for handling contents data in the database
 * for CRUD operations.
 */
class ContentManager {
  /**
  * Get the contents with the signed urls.
  */
  async getContents(roomId) {
    const foundContents = await Content.find({roomId: roomId});
    return foundContents;
  }

  async createContent(contentObject) {
    const createdContent =
        await Content.create({
          creatorId: contentObject.creatorId,
          creatorUsername: contentObject.creatorUsername,
          title: contentObject.title,
          text: contentObject.text,
          timestamp: contentObject.timestamp,
          roomId: contentObject.roomId,
          comments: contentObject.comments
        });
    return createdContent;
  }

  async addComment(contentId, createdComment) {
    const updatedContent = await Content.findOneAndUpdate({_id: contentId}, {$push: {comments: createdComment}});
    return updatedContent;
  }
}

export default ContentManager;
