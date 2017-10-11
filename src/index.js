require("babel-polyfill"); // for regeneratorRuntime support on lower node versions
const { S3 } = require("aws-sdk");
const getHttpStream = require("./lib/getHttpStream");
const streamToS3 = require("./lib/streamToS3");
const handleHttpError = require("./lib/handleHttpError");
const {parse: parseUrl}  = require("url");

class HttpToS3 {
  constructor(options = {}) {
    const { s3, s3Region, throwFailures } = options;

    this.throwFailures = throwFailures || false;

    // If a pre-configured S3 client is provided, use it
    if (s3) {
      if (!(s3 instanceof S3)) {
        throw new Error("Invalid S3 client provided");
      }

      this.S3Client = s3;
    } else {
      // Create a new S3 client, currently only the s3 region is supported as an
      // explicit option, since credentials usually inherit from the sdk automatically

      const s3options = {};
      if (s3Region) s3options.region = s3Region;

      this.S3Client = new S3(s3options);
    }
  }

  async request(url, options = {}, body) {
    // Expect options to have request options under the key request and s3
    // options under the key s3

    // Create a full request option object from the URL and the options object
    const parsedUrl = parseUrl(url);

    // Only http/https supported
    if(parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      throw new Error(`Unsupported protocol ${parsedUrl.protocol}`);
    }

    const userOptions = options.request || {};
    const requestOptions = {
      port: parsedUrl.port,
      protocol: parsedUrl.protocol,
      host: parsedUrl.host,
      path: parsedUrl.pathname + (parsedUrl.search || ''), // convert null or undefined to blank string
      ...userOptions
    };
    const response = await getHttpStream(requestOptions, body);
    // To add additional extensibility, we could accept a callback and pass
    // the response to it for custom response handling
    if (response.statusCode > 299) {
      const parsedError = await handleHttpError(response);
      const method = requestOptions.method || "GET";

      if (this.throwFailures) {
        const error = new Error("Request Error");
        error.body = parsedError.body;
        error.headers = parsedError.headers;
        error.httpVersion = parsedError.httpVersion;
        error.statusCode = parsedError.statusCode;
        throw error;
      }
      return { method, url, ...parsedError };
    }

    return await streamToS3(response, this.S3Client, options.s3);
  }

  // GET and POST convenience methods, just provides a default method and passes
  // the rest through to request
  async post(url, options = {}, body) {
    const postOptions = options;
    // Some object cleansing
    if(!postOptions.request) postOptions.request = {};
    postOptions.request.method = 'POST';

    return await this.request(url, postOptions, body);
  }

  async get(url, options = {}) {
    const getOptions = options;
    if(!getOptions.request) getOptions.request = {};
    getOptions.request.method = 'GET';

    return await this.request(url, getOptions);
  }
}

module.exports = HttpToS3;
