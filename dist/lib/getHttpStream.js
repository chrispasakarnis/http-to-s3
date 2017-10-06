"use strict";

var _require = require("follow-redirects"),
    http = _require.http,
    https = _require.https;

var getHttpStream = function getHttpStream(options, body) {
  // set the right client based on the request protocol
  var httpClient = options.protocol === "http:" ? http : https;

  // We need to manually wrap this in a promise so we can resolve / reject from
  // within the callback
  return new Promise(function (resolve, reject) {
    // If we get a successful response, resolve with the stream
    var request = httpClient.request(options, resolve);
    request.on("error", reject); // reject the promise if there are connection errors

    // If a body is provided, write it to the request stream, otherwise close it
    if (body) {
      request.write(body);
    }
    request.end();
  });
};

module.exports = getHttpStream;