"use strict";
// jshint esversion:6

const mongoose = require("mongoose");
const userSchema = require('../../schema').userSchema;
const User = new mongoose.model('User', userSchema);
import RoomManager from "../room/RoomManager";

/**
 * This class is responsible for handling user's data in the database
 * for CRUD operations.
 */
class UserManager {

  static USERNAME_AVAILABILITY = {
    AVAILABLE: "Username is available!",
    UNAVAILABLE: "Username is unavailable"
  }

  static EMPTY = "";

  async getUserById(userId) {
    const foundUser = await User.findById(userId);
    return foundUser;
  }

  async getUsersByIds(userIds) {
    const promises = [];
    for (var i = 0; i < userIds.length; i++) {
      promises.push(this.getUserById(userIds[i]));
    }
    const foundUsers = await Promise.all(promises);
    return foundUsers;
  }

  async getUserWithSpecifiedUsername(searchedUsername, username) {
    const query =
        User.find({$and: [
          {username: {$regex: searchedUsername, $options: "i"}},
          {username: {$not: {$eq: username}}}
        ]})
    // const foundUser = await query.limit(1).exec();
    const foundUser = await query.exec();
    return foundUser;
  }

  // Exclude users' whose username is exactly the same as the starting letters.
  async getUsersWithStartingLetters(matchedUser, startingLetters, username, limit) {
    var matchedUsername;
    if (matchedUser.length > 0) {
      matchedUsername = matchedUser[0].username;
    } else {
      matchedUsername = RoomManager.EMPTY;
    }
    const foundUsers = await User.find(
        {$and: [
          {username: {$regex: '^' + startingLetters, $options: "i"}},
          {username: {$not: {$eq: username}}},
          {username: {$not: {$eq: matchedUsername}}}
        ]})
        .limit(limit)
        .exec();
    return foundUsers;
  }

  async getExistingUsers(username, startingLetters, limit) {
    const matchedUser =
        await this.getUserWithSpecifiedUsername(startingLetters, username);
    const foundUsers =
        await this.getUsersWithStartingLetters(
          matchedUser, startingLetters, username, limit);
    if (matchedUser.length > 0) {
      foundUsers.unshift(matchedUser[0]);
    }
    return foundUsers;
  }

  /**
  * Also stores the file to Google Cloud Storage.
  */
  async updateUser(userId, userObject) {
    const updatedUser = await User.findOneAndUpdate({_id: userId}, {
      username: userObject.username,
      name: userObject.name,
      country: userObject.country,
      course: userObject.course
    });
    return updatedUser;
  }
}

export default UserManager;
