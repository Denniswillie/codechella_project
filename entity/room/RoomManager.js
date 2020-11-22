"use strict";
// jshint esversion:6

const mongoose = require("mongoose");
const roomSchema = require('../../schema').roomSchema;
const Room = new mongoose.model('Room', roomSchema);

/**
 * This class is responsible for handling rooms data in the database
 * for CRUD operations.
 */
class RoomManager {

  static PRIVACY_TYPE = {
    PUBLIC: 'public',
    PRIVATE: 'private'
  }

  static ROOMNAME_AVAILABILITY = {
    AVAILABLE: "room name is available!",
    UNAVAILABLE: "room name is unavailable"
  }

  static EMPTY = "";

  async getRoomWithSpecifiedName(searchedName) {
    const foundRoom =
        Room.find({name: {$regex: '^' + searchedName + '$', $options: "i"}})
        .limit(1)
        .exec();
    return foundRoom;
  }

  async getRoomsWithStartingLetters(
    startingLetters, matchedRoom, limit) {
    var matchedRoomName;
    if (matchedRoom.length > 0) {
      matchedRoomName = matchedRoom[0].name;
    } else {
      matchedRoomName = RoomManager.EMPTY;
    }
    const foundRooms = await Room.find(
        {$and: [
          {name: {$regex: '^' + startingLetters, $options: "i"}},
          {name: {$not: {$eq: matchedRoomName}}}
        ]})
        .limit(limit)
        .exec();
    return foundRooms;
  }

  async getExistingRooms(startingLetters, limit) {
    const matchedRoom =
        await this.getRoomWithSpecifiedName(startingLetters);
    const existingRooms =
        await this.getRoomsWithStartingLetters(
          startingLetters, matchedRoom, limit);
    if (matchedRoom.length > 0) {
      existingRooms.unshift(matchedRoom[0]);
    }
    return existingRooms;
  }

  async createRoom(roomObject) {
    const createdRoom =
        await Room.create({
          creatorId: roomObject.creatorId,
          name: roomObject.name,
          description: roomObject.description,
          listOfStudents: roomObject.listOfStudents,
          privacyType: roomObject.privacyType,
          accessRequests: roomObject.accessRequests
        });
    return createdRoom;
  }

  async requestAccessToRoom(roomId, requesterId) {
    const foundRoom =
        await Room.findOneAndUpdate({
          _id: roomId
        }, {
          $push: {
            accessRequests: requesterId
          }
        });
    return foundRoom;
  }

  async acceptRoomRequestAccess(roomId, requesterId) {
    const foundRoom =
        await Room.findOneAndUpdate({
          _id: roomId
        }, {
          $pull: {
            accessRequests: requesterId
          },
          $push: {
            listOfStudents: requesterId
          }
        });
    return foundRoom;
  }

  async denyRoomRequestAccess(roomId, requesterId) {
    const foundRoom =
        await Room.findOneAndUpdate({
          _id: roomId
        }, {
          $pull: {
            accessRequests: requesterId
          }
        });
    return foundRoom;
  }

  async getRoomWithId(roomId) {
    const foundRoom = await Room.findById(roomId);
    return foundRoom;
  }
}

export default RoomManager;
