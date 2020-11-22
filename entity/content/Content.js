"use strict";
//jshint esversion:6

class Content {

  static PROPERTY = {
    CREATOR_ID: 'creatorId',
    CREATOR_USERNAME: 'creatorUsername',
    TITLE: 'title',
    TEXT: 'text',
    TIMESTAMP: 'timestamp',
    ROOM_ID: 'roomId',
    COMMENTS: 'comments'
  }

  constructor(build) {
    if (arguments.length === 1 && this.validateBuild(build)) {
      const creatorId = build.creatorId;
      const creatorUsername = build.creatorUsername;
      const title = build.title;
      const text = build.text;
      const timestamp = build.timestamp;
      const roomId = build.roomId;
      const comments = build.comments;
      Object.defineProperties(this, {
        creatorId: {
          value: creatorId,
          writable: false
        },
        creatorUsername: {
          value: creatorUsername,
          writable: false
        },
        title: {
          value: title,
          writable: false
        },
        text: {
          value: text,
          writable: false
        },
        timestamp: {
          value: timestamp,
          writable: false
        },
        roomId: {
          value: roomId,
          writable: false
        },
        comments: {
          value: comments,
          writable: false
        }
      });
    }
  }
  validateBuild(build) {
    return (String(build.constructor) === String(Content.Builder));
  }
  static get Builder() {
    class Builder {
      setCreatorId(creatorId) {
        this.creatorId = creatorId;
        return this;
      }
      setCreatorUsername(creatorUsername) {
        this.creatorUsername = creatorUsername;
        return this;
      }
      setTitle(title) {
        this.title = title;
        return this;
      }
      setText(text) {
        this.text = text;
        return this;
      }
      setTimestamp(timestamp) {
        this.timestamp = timestamp;
        return this;
      }
      setRoomId(roomId) {
        this.roomId = roomId;
        return this;
      }
      setComments(comments) {
        this.comments = comments;
        return this;
      }
      build() {
        return new Content(this);
      }
    }
    return Builder;
  }
}

export default  Content;
