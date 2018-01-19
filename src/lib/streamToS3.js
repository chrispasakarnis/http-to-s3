module.exports = async (
  response,
  S3Client,
  s3Options = {},
  uploadOptions = {}
) => {
  const uploadParams = { Body: response, ...s3Options };
  // TODO: s3 options could be parameterized and taken from the options object
  const options = { partSize: 10 * 1024 * 1024, queueSize: 1 };

  const uploadProgress =
    typeof uploadOptions.uploadProgress === "function"
      ? uploadOptions.uploadProgress
      : () => {};
  return await S3Client.upload(uploadParams, options)
    .on("httpUploadProgress", uploadProgress)
    .promise();
};
