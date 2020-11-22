"use strict";
//jshint esversion:6

class User {

  static PROPERTY = {
    USERNAME: 'username',
    GOOGLE_ID: 'googleId',
    OUTLOOK_ID: 'outlookId',
    FACEBOOK_ID: 'facebookId',
    NAME: 'name',
    COUNTRY: 'country',
    COURSE: 'course'
  }

  constructor(build) {
    if (arguments.length === 1 && this.validateBuild(build)) {
      const username = build.username;
      const name = build.name;
      const country = build.country;
      const course = build.course;
      Object.defineProperties(this, {
        username: {
          value: username,
          writable: false
        },
        name: {
          value: name,
          writable: false
        },
        country: {
          value: country,
          writable: false
        },
        course: {
          value: course,
          writable: false
        }
      });
    }
  }
  validateBuild(build) {
    return (String(build.constructor) === String(User.Builder));
  }
  static get Builder() {
    class Builder {
      setUsername(username) {
        this.username = username;
        return this;
      }
      setName(name) {
        this.name = name;
        return this;
      }
      setCountry(country) {
        this.country = country;
        return this;
      }
      setCourse(course) {
        this.course = course;
        return this;
      }
      build() {
        return new User(this);
      }
    }
    return Builder;
  }
}

export default User;
