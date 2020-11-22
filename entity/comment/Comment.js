"use strict";
//jshint esversion:6

class Comment {

  static PROPERTY = {
    CREATOR_ID: 'creatorId',
    CONTENT_ID: 'contentId',
    NUM_OF_LIKES: 'numOfLikes',
    TEXT: 'text',
    LIKERS_ID: 'likersId'
  }

  constructor(build) {
    if (arguments.length === 1 && this.validateBuild(build)) {
      const creatorId = build.creatorId;
      const contentId = build.contentId;
      const numOfLikes = build.numOfLikes;
      const text = build.text;
      const likersId = build.likersId;
      Object.defineProperties(this, {
        creatorId: {
          value: creatorId,
          writable: false
        },
        contentId: {
          value: contentId,
          writable: false
        },
        numOfLikes: {
          value: numOfLikes,
          writable: false
        },
        text: {
          value: text,
          writable: false
        },
        likersId: {
          value: likersId,
          writable: false
        }
      });
    }
  }
  validateBuild(build) {
    return (String(build.constructor) === String(Comment.Builder));
  }
  static get Builder() {
    class Builder {
      setCreatorId(creatorId) {
        this.creatorId = creatorId;
        return this;
      }
      setContentId(contentId) {
        this.contentId = contentId;
        return this;
      }
      setNumOfLikes(numOfLikes) {
        this.numOfLikes = numOfLikes;
        return this;
      }
      setText(text) {
        this.text = text;
        return this;
      }
      setLikersId(likersId) {
        this.likersId = likersId;
        return this;
      }
      build() {
        return new Comment(this);
      }
    }
    return Builder;
  }
}

export default Comment;
