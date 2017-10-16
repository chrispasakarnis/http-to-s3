# HTTP to S3

This module streams a HTTP response to an S3 bucket. Both the HTTP response and the S3 upload are implemented using streams allowing large responses to be retrieved without having to worry about memory / disk space limitations.

## Installation
`npm install --save http-to-s3`

## Usage

Basic usage
```
const HttpToS3 = require("http-to-s3");
const httpS3Client = new HttpToS3();

const options = {
  s3: {
    Bucket: "sample-bucket",
    Key: "path/to/file.html"
  }
};
// Defaults to GET request
const uploadResult = await httpS3Client.get("http://example.com", options)
```

Advanced examples:

Post a body to the URL and stream the results to S3
```
const HttpToS3 = require("http-to-s3");
const httpS3Client = new HttpToS3();

const postData = JSON.stringify({ test: true });

const options = {
  request:{
    headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
    }
  }
  s3: {
    Bucket: "sample-bucket",
    Key: "path/to/file.html"
  }
};

const uploadResult = await httpS3Client.post("http://google.com/upload", options, postData)
```

Constructor details

`new HttpToS3(options = {}) ⇒ Object`

The constructor takes an options object with the following parameters:
* s3 -- ***< S3 Client >*** -- an optional instantiated S3 client. See the AWS credentials section for an example.
* s3Region -- ***string*** -- If provided and an S3 client isn't provided, a new client will be created with this as the default region
* throwFailures -- ***boolean*** -- If set to true, the client will throw an error if the server returns a non-2xx response, otherwise an object is returned. Default: false

It returns an object will the following methods:

`httpS3Client.request(url, options, body) ⇒ Object`
* url -- ***string*** -- a string URL that can be parsed by the Node [URL Class](https://nodejs.org/api/url.html)
* options -- ***object*** -- an object with two keys, a set of request options and and S3 options
  * request -- an options object that will be fed into the [HTTP.request](https://nodejs.org/api/http.html#http_http_request_options_callback).
    * Note, protocol, host, path, and port will be set automatically from the URL. If method is not set, it will be defaulted to `GET`
  * s3 -- ***object*** -- an options object that will be fed into the [S3 upload method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property)
    * Simplest usage is to just provide `Bucket` and `Key`
* body -- ***string /  Buffer*** -- An optional string or buffer to be written to the request body

`httpS3Client.post(url, options, body) ⇒ Object`

The post method is largely identical to the request method, however it will default the method on the request to `POST`

`httpS3Client.get(url, options) ⇒ Object`

The post method is largely identical to the request method, however it will default the method on the request to `GET`


### AWS Credentials
This module uses the Node AWS SDK, therefore it will look for credentials in the places [specified by the AWS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Setting_AWS_Credentials).

If you need to specify your credentials manually, you can provide a pre-configured [AWS S3 Client](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html) to the constructor.
```
const AWS = require('aws-sdk');
const HttpToS3 = require('http-to-s3');
const S3Client = new AWS.S3({
  accessKeyId: <key id here>,
  accessKeyId: <secret key here>,
});

const httpS3Client = new HttpToS3({ s3: S3Client });
```


## Tests
Test specs live side-by-side with the file they're testing, following the standard Jest pattern `file.test.js`.

To run tests: `npm test`

## build

To build the dist files: `npm run build`
