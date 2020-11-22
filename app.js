"use strict";
//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const OutlookStrategy = require('passport-outlook').Strategy;
const ObjectId = require("mongodb").ObjectID;
const userSchema = require('./schema').userSchema;
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
import GoogleFileStorageManager from './fileStorage/managerTypes/GoogleFileStorageManager.js';
const app = express();
const port = 3000;

class App {
  constructor() {
    this.initExpressMiddlewares();
    this.initMongooseConnection();
    this.initPassportAuthentication();
    this.useRoutes();
    this.initListener();
  }

  initExpressMiddlewares() {
    app.use(express.static(__dirname + '/public'));
    app.use("/room", express.static(__dirname + '/public'));
    app.set('view engine', 'ejs');
    app.use(bodyParser.urlencoded({extended: true}));

    // Set up session.
    app.use(session({
      secret: "secret",
      resave: false,
      saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());
  }

  initMongooseConnection() {
    mongoose.connect("mongodb://localhost:27017/dkitInterHubDB", {useNewUrlParser: true, useUnifiedTopology: true});
    mongoose.set("useCreateIndex", true);
    mongoose.set('useFindAndModify', false);
  }

  initPassportAuthentication() {
    userSchema.plugin(passportLocalMongoose);
    userSchema.plugin(findOrCreate);
    const User = new mongoose.model("User", userSchema);
    passport.use(User.createStrategy());

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/dashboard",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
      },
      function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({
          googleId: profile.id,
          name: profile.displayName
        }, function(err, user) {
          return cb(err, user);
        });
      }
    ));

    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/dashboard"
      },
      function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({
          facebookId: profile.id,
          name: profile.displayName
        }, function(err, user) {
          return cb(err, user);
        });
      }
    ));

    passport.use(new OutlookStrategy({
        clientID: process.env.OUTLOOK_CLIENT_ID,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/outlook/dashboard'
      },
      function(accessToken, refreshToken, profile, done) {
        var user = {
          outlookId: profile.id,
          name: profile.DisplayName,
          email: profile.EmailAddress,
          accessToken: accessToken
        };
        if (refreshToken)
          user.refreshToken = refreshToken;
        if (profile.MailboxGuid)
          user.mailboxGuid = profile.MailboxGuid;
        if (profile.Alias)
          user.alias = profile.Alias;
        User.findOrCreate({
            outlookId: profile.id,
            name: profile.displayName
          },

          function(err, user) {
            return done(err, user);
          });
      }
    ));

  }

  useRoutes() {
    app.use('/auth', require('./routes/auth'));
    app.use(require('./routes/index'));
    app.use('/test', require('./routes/test'));
  }

  initListener() {
    app.listen(port, function() {
      console.log("Server started on port " + port);
    });
  }
}

// Initialize App object to run server.
new App();
