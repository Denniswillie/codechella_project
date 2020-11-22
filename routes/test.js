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
import Comment from "../entity/comment/Comment";
import Room from "../entity/room/Room";
import GoogleFileStorageManager from "../fileStorage/managerTypes/GoogleFileStorageManager";
const userManager = new UserManager();
const contentManager = new ContentManager();
const commentManager = new CommentManager();
const roomManager = new RoomManager();
const googleFileStorageManager = new GoogleFileStorageManager();

// router.get('/getDashboardContents', function(req, res) {
//   contentManager.getContents(undefined)
//       .then((dashboardContents) => {
//         console.log(dashboardContents);
//         res.end();
//       })
// });

// router.get('/getUserProfileImageUrl', function(req, res) {
//   contentManager.getContents(undefined)
//       .then((contents) => {
//         const promises = [];
//         promises.push(
//           contents,
//           googleFileStorageManager.downloadFromBucket(
//             req.user.id,
//             GoogleFileStorageManager.STORAGE.BUCKET.USER_PROFILE_IMAGE,
//             GoogleFileStorageManager.STORAGE.FILE_TYPE.IMAGE
//           ),
//           googleFileStorageManager.downloadFromBucket(
//             req.user.id,
//             GoogleFileStorageManager.STORAGE.BUCKET.USER_PROFILE_IMAGE,
//             GoogleFileStorageManager.STORAGE.FILE_TYPE.IMAGE
//           ),
//           googleFileStorageManager.downloadFromBucket(
//             req.user.id,
//             GoogleFileStorageManager.STORAGE.BUCKET.USER_PROFILE_IMAGE,
//             GoogleFileStorageManager.STORAGE.FILE_TYPE.IMAGE
//           )
//         )
//         return Promise.all(promises)
//       })
//   .then((mylist) => {
//     console.log(mylist);
//     res.render("test", {url: mylist});
//   })
// });

// router.get('/getDashboardContentsImageUrls', function(req, res) {
//   contentManager.getContents(undefined)
//       .then((dashboardContents) => {
//         googleFileStorageManager.downloadMultipleFromBuckets(
//           dashboardContents,
//           GoogleFileStorageManager.STORAGE.BUCKET.CONTENT_IMAGE,
//           GoogleFileStorageManager.STORAGE.FILE_TYPE.IMAGE
//         )
//       })
//       .catch((err) => {console.log(err)})
//       .then((dashboardContentsImageUrls) => {
//         console.log(dashboardContentsImageUrls);
//         res.end();
//       })
// });
router.get('/addComment', function(req, res) {
  const contentId = mongoose.Types.ObjectId("5f830ebae6d68c5b409ca5ee");
  const commentObject =
      new Comment.Builder()
      .setCreatorId(req.user._id)
      .setContentId(contentId)
      .setNumOfLikes(20)
      .setText('this is a comment')
      .setLikersId([])
      .build();
  commentManager.createComment(commentObject)
      .then((createdComment) => {
        console.log(createdComment);
        contentManager.addComment(contentId, createdComment);
      })
      .then(res.end());
});

router.get('/addContent', function(req, res) {
  const contentObject =
      new Content.Builder()
      .setCreatorId(req.user._id)
      .setCreatorUsername(req.user.username)
      .setTitle("title")
      .setText("test")
      .setTimestamp(123)
      .setRoomId(undefined)
      .setComments([])
      .build();
  contentManager.createContent(contentObject)
      .then((createdContent) => {
        console.log(createdContent._id);
        res.end();
      });
});

router.get('/toggleCommentLike', function(req, res) {
  commentManager.toggleCommentLike(mongoose.Types.ObjectId('5f8311778067a62fc00a839a'), req.user._id)
      .then(res.end());
});

router.get('/deleteComment', function(req, res) {
  commentManager.deleteComment(mongoose.Types.ObjectId('5f80f8d458c5bab5b417365b'))
      .then(res.end());
});

module.exports = router;
