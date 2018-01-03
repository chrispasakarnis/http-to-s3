'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var NOOP = function NOOP() {};

module.exports = function (response, S3Client) {
  var s3Options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var uploadParams = _extends({ Body: response }, s3Options);
  // TODO: s3 options could be parameterized and taken from the options object
  var options = { partSize: 10 * 1024 * 1024, queueSize: 1 };

  // The promise() method is not supported on s3 upload, so we again explicitly
  // created promise that we can reject/resolve once the file is uploaded to S3
  return new Promise(function (resolve, reject) {
    S3Client.upload(uploadParams, options).on('httpUploadProgress', s3Options.httpUploadProgress || NOOP).send(function (err, uploadResult) {
      if (err) return reject(err);
      return resolve(uploadResult);
    });
  });
};