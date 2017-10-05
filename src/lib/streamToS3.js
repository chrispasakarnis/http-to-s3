module.exports = (response, S3Client, s3Options = {}) => {
  const uploadParams = { Body: response, ...s3Options };
  // TODO: s3 options could be parameterized and taken from the options object
  const options = {partSize: 10 * 1024 * 1024, queueSize: 1};

  // The promise() method is not supported on s3 upload, so we again explicitly
  // created promise that we can reject/resolve once the file is uploaded to S3
  return new Promise((resolve, reject) => {
    S3Client.upload(uploadParams, options, (err, uploadResult) => {
      if (err) return reject(err);
      return resolve(uploadResult);
    });
  });
};
