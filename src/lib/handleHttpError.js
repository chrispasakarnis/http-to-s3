const streamToPromise = require("stream-to-promise");
// Streams the response body, and packages it in an object with some extra
// request metadata
module.exports = async errorStream => {
  const { headers, httpVersion, statusCode } = errorStream;
  const error = await streamToPromise(errorStream); // returns a buffer

  // We're assuming utf8, but we could parameterize this to handle other encodings
  const errorText = error.toString("utf8");

  return { success: false, body: errorText, headers, httpVersion, statusCode };
};
