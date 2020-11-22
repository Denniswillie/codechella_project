const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer')
const upload = multer({
  dest: '../uploadedImage'
});
import UserManager from "../entity/user/UserManager";
import ContentManager from "../entity/content/ContentManager";
import CommentManager from "../entity/comment/CommentManager";
import RoomManager from "../entity/room/RoomManager";
import User from "../entity/user/User";
import Content from "../entity/content/Content";
import Comment from "../entity/comment/Comment"
import Room from "../entity/room/Room";
import GoogleFileStorageManager from "../fileStorage/managerTypes/GoogleFileStorageManager";
const userManager = new UserManager();
const contentManager = new ContentManager();
const commentManager = new CommentManager();
const roomManager = new RoomManager();
const googleFileStorageManager = new GoogleFileStorageManager();

// Setup server requests and responses on different routes.
router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.render("home");
  }
});

router.get("/dashboard", function(req, res) {
  if (req.isAuthenticated()) {
    if (req.user.username === undefined) {
      res.redirect("/userProfileInput");
    } else {
      contentManager.getContents(undefined)
          .then((dashboardContents) => {
            const promises = [];
            promises.push(
              dashboardContents,
              googleFileStorageManager.downloadMultipleFromBuckets(
                dashboardContents,
                GoogleFileStorageManager.STORAGE.BUCKET.CONTENT_IMAGE,
                GoogleFileStorageManager.STORAGE.FILE_TYPE.IMAGE
              ),
              googleFileStorageManager.downloadFromBucket(
                req.user._id,
                GoogleFileStorageManager.STORAGE.BUCKET.USER_PROFILE_IMAGE,
                GoogleFileStorageManager.STORAGE.FILE_TYPE.IMAGE
              )
            )
            return Promise.all(promises);
          })
          .catch((err) => {console.log(err)})
          .then((data) => {
            res.render("dashboard", {
              user: req.user,
              contents: data[0],
              contentImageSignedUrls: data[1],
              userProfileImageSignedUrl: data[2]
            });
          })
          .catch((err) => {console.log(err)});
    }
  } else {
    res.redirect("/login");
  }
});

router.get("/login", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("dashboard");
  } else {
    res.render("login");
  }
});

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

router.post("/createContent", upload.single("contentImage"), function(req, res) {
  const title = req.body.title;
  const text = req.body.text;
  var redirectUrl;
  var roomId;
  if (req.body.roomId === undefined) {
    redirectUrl = "/dashboard";
  } else {
    roomId = mongoose.Types.ObjectId(req.body.roomId);
    redirectUrl = "/room/" + roomId;
  }
  const content =
      new Content.Builder()
      .setCreatorId(req.user._id)
      .setCreatorUsername(req.user.username)
      .setTitle(title)
      .setText(text)
      .setTimestamp(Math.floor(Date.now() / 1000))
      .setRoomId(roomId)
      .build();

  contentManager.createContent(content)
      .then((createdContent) => {
        if (req.file) {
          googleFileStorageManager.uploadToBucket(
            GoogleFileStorageManager.STORAGE.BUCKET.CONTENT_IMAGE,
            req.file.path,
            createdContent,
            GoogleFileStorageManager.STORAGE.FILE_TYPE.IMAGE
          )
          .then(res.redirect(redirectUrl));
        } else {
          res.redirect(redirectUrl);
        }
      });
});

router.get("/userProfileInput", function(req, res) {
  res.render("userProfileInput");
});

router.get("/editUserProfile", function(req, res) {
  res.render("userProfileInput");
})

router.post("/usernameAvailabilityChecker", function(req, res) {
  const enteredUsername = req.body.username;
  userManager.getUserWithSpecifiedUsername(enteredUsername)
      .then((foundUser) => {
        if (foundUser.length > 0) {
          res.send(UserManager.USERNAME_AVAILABILITY.UNAVAILABLE);
        } else {
          res.send(UserManager.USERNAME_AVAILABILITY.AVAILABLE);
        }
      })
      .catch((err) => {console.log(err)});
});

router.post("/userProfileInput", upload.single("userProfileImage"), function(req, res) {
  const userObject =
      new User.Builder()
      .setUsername(req.body.username)
      .setName(req.user.name)
      .setCountry(req.body.country)
      .setCourse(req.body.course)
      .build();
  var filePath;
  if (!req.file) {
    filePath = "./defaultProfilePicture.png";
  } else {
    filePath = req.file.path;
  }
  userManager.updateUser(req.user._id, userObject)
      .then((updatedUser) => {
        googleFileStorageManager.uploadToBucket(
          GoogleFileStorageManager.STORAGE.BUCKET.USER_PROFILE_IMAGE,
          filePath,
          updatedUser,
          GoogleFileStorageManager.STORAGE.FILE_TYPE.IMAGE
        )
      })
      .catch((err) => {console.log(err)})
      .then(res.redirect("/dashboard"))
      .catch((err) => {console.log(err)});
});

router.get("/createRoom", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("createRoom");
  } else {
    res.redirect("/login");
  }
});

router.post("/existingUsers", function(req, res) {
  userManager.getExistingUsers(req.user.username, req.body.inputElement, 5)
      .then((existingUsers) => {
        res.send(existingUsers);
      })
      .catch((err) => {console.log(err)});
});

router.post("/existingRooms", function(req, res) {
  roomManager.getExistingRooms(req.body.inputElement, 5)
      .then((existingRooms) => {
        res.send(existingRooms);
      })
});

router.post("/roomnameAvailabilityChecker", function(req, res) {
  const roomname = req.body.roomname;
  roomManager.getRoomWithSpecifiedName(req.body.roomname)
      .then((foundRoom) => {
        if (foundRoom.length > 0) {
          res.send(RoomManager.ROOMNAME_AVAILABILITY.UNAVAILABLE);
        } else {
          res.send(RoomManager.ROOMNAME_AVAILABILITY.AVAILABLE);
        }
      })
      .catch((err) => {console.log(err)});
});

router.post("/createRoom", function(req, res) {
  const privacyType = req.body.privacyType;
  const listOfStudents = [req.user._id];
  if (privacyType == RoomManager.PRIVACY_TYPE.PRIVATE) {
    if (req.body.selectedFriends != undefined) {
      req.body.selectedFriends.map(function(friendId) {
        listOfStudents.push(friendId);
      });
    }
  }
  const roomObject =
      new Room.Builder()
      .setCreatorId(req.user._id)
      .setName(req.body.name)
      .setDescription(req.body.description)
      .setListOfStudents(listOfStudents)
      .setPrivacyType(privacyType)
      .setAccessRequests([])
      .build();
  roomManager.createRoom(roomObject)
      .then((createdRoom) => {
        res.redirect('/room/' + createdRoom._id);
      })
      .catch((err) => {console.log(err)});
});

router.get("/room/:roomId", function(req, res) {
  const roomId = mongoose.Types.ObjectId(req.params.roomId);
  contentManager.getContents(roomId)
      .then((roomContents) => {
        const promises = [];
        promises.push(
          roomContents,
          roomManager.getRoomWithId(roomId),
          googleFileStorageManager.downloadMultipleFromBuckets(
            roomContents,
            GoogleFileStorageManager.STORAGE.BUCKET.CONTENT_IMAGE,
            GoogleFileStorageManager.STORAGE.FILE_TYPE.IMAGE
          ),
          googleFileStorageManager.downloadFromBucket(
            req.user._id,
            GoogleFileStorageManager.STORAGE.BUCKET.USER_PROFILE_IMAGE,
            GoogleFileStorageManager.STORAGE.FILE_TYPE.IMAGE
          )
        );
        return Promise.all(promises);
      })
      .catch((err) => {console.log(err)})
      .then((data) => {
        data.push(
          userManager.getUsersByIds(
            data[1].accessRequests)
        );
        return Promise.all(data);
      })
      .catch((err) => {console.log(err)})
      .then((data) => {
        /**
        * The order of the data:
        * [0] = roomContents
        * [1] = foundRoom
        * [2] = contentImageSignedUrls
        * [3] = userProfileImageSignedUrl
        * [4] = requesting_users (in the form of userSchema)
        */
        var accessStatus;
        if (data[1] == null) {
          res.status(404).send("Room is not found.");
        } else if (data[1].privacyType == Room.PRIVACY_TYPE.PUBLIC) {
          accessStatus = Room.ACCESS_STATUS.GRANTED;
        } else if (data[1].listOfStudents.includes(req.user._id)) {
          accessStatus = Room.ACCESS_STATUS.GRANTED;
        } else if (data[1].accessRequests.includes(req.user._id)) {
          accessStatus = Room.ACCESS_STATUS.REQUESTED;
        } else {
          accessStatus = Room.ACCESS_STATUS.DENIED;
        }
        res.render('room', {
          user: req.user,
          userProfileImage: data[3],
          contents: data[0],
          requesting_users: data[4],
          room: data[1],
          contentImageSignedUrls: data[2],
          accessStatus: accessStatus
        });
      })
      .catch((err) => {console.log(err)});
});

router.post("/requestAccess", function(req, res) {
  const roomId = mongoose.Types.ObjectId(req.body.roomId);
  roomManager.requestAccessToRoom(roomId, req.user._id)
      .then(res.redirect('/room/' + roomId));
});

router.post("/acceptRequestAccess", function(req, res) {
  const requesterId = mongoose.Types.ObjectId(req.body.requesterId);
  const roomId = mongoose.Types.ObjectId(req.body.roomId);
  roomManager.acceptRoomRequestAccess(roomId, requesterId)
      .then(res.redirect('/room/' + roomId))
      .catch((err) => {console.log(err)});
});

router.post("/denyRequestAccess", function(req, res) {
  const requesterId = mongoose.Types.ObjectId(req.body.requesterId);
  const roomId = mongoose.Types.ObjectId(req.body.roomId);
  roomManager.denyRoomRequestAccess(roomId, requesterId)
      .then(res.redirect('/room/' + roomId))
      .catch((err) => {console.log(err)});
});

router.post("/createComment", function(req, res) {
  const contentId = req.body.contentId;
  const text = req.body.test;
  const commentObject =
      new Comment.Builder()
      .setCreatorId(req.user._id)
      .setContentId(contentId)
      .setNumOfLikes(CommentManager.INITIAL_NUM_OF_LIKES)
      .setText(text)
      .setLikersId([])
      .build();
  commentManager.createComment(commentObject)
      .then((createdComment) => {
        res.send(createdComment);
      })
      .catch((err) => {
        console.log(err);
        res.send(CommentManager.ACTION_STATUS.FAILED);
      })
});

router.delete("/deleteComment", function(req, res) {
  const commentId = req.body.commentId;
  commentManager.deleteComment(commentId)
      .then(res.send(CommentManager.ACTION_STATUS.SUCCESS))
      .catch((err) => {
        console.log(err);
        res.send(CommentManager.ACTION_STATUS.FAILED);
      })
});

router.patch("/toggleCommentLike", function(req, res) {
  const commentId = req.body.commentId;
  commentManager.toggleCommentLike(commentId, req.user._id)
      .then(res.send(true))
      .catch((err) => {
        console.log(err);
        res.send(false);
      });
});

module.exports = router;
