"use strict";
// jshint esversion:6
const {
  Storage
} = require('@google-cloud/storage');
const projectId = "dkitinterhub";
const keyFilename = './DkitInterHub-18ea7da7837a.json';
const storage = new Storage({
  projectId,
  keyFilename
});

/**
 * This class is responsible for storing and downloading files from
 * Google Cloud Storage.
 */

class GoogleFileStorageManager {
  static STORAGE = {
    FILE_TYPE: {
      IMAGE: ".img",
      VIDEO: ".vid"
    },
    DOWNLOAD_OPTIONS: {
      action: "read",
      expires: '12-31-9999'
    },
    BUCKET: {
      USER_PROFILE_IMAGE: storage.bucket('studentinterhub_userprofileimages'),
      ROOM_IMAGE: storage.bucket('studentinterhub_roomimages'),
      CONTENT_IMAGE: storage.bucket('studentinterhub_contentimages')
    },
    UPLOAD_OPTIONS: (item, fileType) => {
      return {
        destination: String(item._id).concat(fileType),
        resumable: true,
        validation: 'crc32c'
      }
    }
  }

  // Returns the file that was uploaded..
  async uploadToBucket(bucket, filePath, item, fileType) {
    const file =
      await bucket.upload(
        filePath,
        GoogleFileStorageManager.STORAGE.UPLOAD_OPTIONS(item, fileType)
      );
    return file;
  }

  async downloadFromBucket(id, bucket, fileType) {
    const file = await bucket.file(String(id).concat(fileType));
    const url =
        await file.getSignedUrl(
          GoogleFileStorageManager.STORAGE.DOWNLOAD_OPTIONS);
    return url;
  }

  async downloadMultipleFromBuckets(items, bucket, fileType) {
    const promises = [];
    for (var i = 0; i < items.length; i++) {
      const fileName = items[i]._id + fileType;
      const file = await bucket.file(fileName);
      const fileExists = await file.exists();
      if (fileExists[0]) {
        promises.push(
          file.getSignedUrl(GoogleFileStorageManager.STORAGE.DOWNLOAD_OPTIONS));
      } else {
        promises.push("");
      }
    }
    const urls = await Promise.all(promises);
    return urls;
  }
}

export default GoogleFileStorageManager;
