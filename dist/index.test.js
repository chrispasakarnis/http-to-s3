"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Mock out our modules with side-effects
jest.mock("./lib/getHttpStream");
jest.mock("./lib/streamToS3");
jest.mock("./lib/handleHttpError");

var HttpToS3 = require("./index");
var getHttpStream = require("./lib/getHttpStream");
var streamToS3 = require("./lib/streamToS3");
var handleHttpError = require("./lib/handleHttpError");

var _require = require("aws-sdk"),
    S3 = _require.S3;

describe("Class constructor", function () {
  it("Should set a default for throwFailures", function () {
    expect.assertions(1);
    var client = new HttpToS3();
    expect(client.throwFailures).toBe(false);
  });

  it("Should set throwFailures", function () {
    expect.assertions(1);
    var client = new HttpToS3({ throwFailures: true });
    expect(client.throwFailures).toBe(true);
  });

  it("Should throw if provided an invalid S3 client", function () {
    expect.assertions(1);
    expect(function () {
      new HttpToS3({ s3: {} });
    }).toThrow("Invalid S3 client provided");
  });

  it("Should set the S3 client if provided", function () {
    expect.assertions(1);
    var sampleS3 = new S3();
    var client = new HttpToS3({ s3: sampleS3 });
    expect(client.S3Client).toBe(sampleS3);
  });

  it("Should create an S3 client if none provided", function () {
    expect.assertions(1);
    var client = new HttpToS3();
    expect(client.S3Client).toBeInstanceOf(S3);
  });

  it("Should set the S3 region if provided", function () {
    expect.assertions(2);
    var client = new HttpToS3({ s3Region: "us-west-1" });
    expect(client.S3Client).toBeInstanceOf(S3);
    expect(client.S3Client.config.region).toBe("us-west-1");
  });
});

describe("request method", function () {
  it("Should successfully stream to S3", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var mockS3Return, client, result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            expect.assertions(1);

            mockS3Return = {
              ETag: '"d71816d724ec0cbd97cecb03814bffe2"',
              Location: "https://sample-bucket.s3.amazonaws.com/file.txt",
              key: "file.txt",
              Key: "file.txt",
              Bucket: "sample-bucket"
            };
            client = new HttpToS3();

            getHttpStream.mockReturnValueOnce(Promise.resolve({ statusCode: 200 }));
            streamToS3.mockReturnValueOnce(Promise.resolve(mockS3Return));
            _context.next = 7;
            return client.request("https://example.com");

          case 7:
            result = _context.sent;

            expect(result).toBe(mockS3Return);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  it("Should throw if protocol is unsupported", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var client;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            expect.assertions(1);

            client = new HttpToS3();
            _context2.prev = 2;
            _context2.next = 5;
            return client.request("ssh://example.com");

          case 5:
            _context2.next = 10;
            break;

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](2);

            expect(_context2.t0.message).toBe('Unsupported protocol ssh:');

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[2, 7]]);
  })));

  it("Should set request parameters correctly", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    var client, options, body;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            expect.assertions(1);
            client = new HttpToS3();

            getHttpStream.mockReturnValueOnce(Promise.resolve({ statusCode: 200 }));
            options = {
              request: {
                port: 8443,
                someOtherParam: "parameter"
              }
            };
            body = "test-body";
            _context3.next = 7;
            return client.request("https://example.com", options, body);

          case 7:
            expect(getHttpStream).toHaveBeenCalledWith({
              port: 8443,
              protocol: "https:",
              host: "example.com",
              path: "/",
              someOtherParam: "parameter"
            }, body);

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  })));

  it("Should throw errors if throwFailures is set", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    var client, mockErrorResponse;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            expect.assertions(5);
            client = new HttpToS3({ throwFailures: true });

            getHttpStream.mockReturnValueOnce(Promise.resolve({ statusCode: 500 }));
            mockErrorResponse = {
              success: false,
              body: "This is an error",
              headers: {},
              httpVersion: "1.1",
              statusCode: 500
            };

            handleHttpError.mockReturnValueOnce(Promise.resolve(mockErrorResponse));

            // We could use Jest's toThrow() expectation, but by manually catching the
            // the error, we can easily test the extra values that are attached to it
            _context4.prev = 5;
            _context4.next = 8;
            return client.request("https://example.com");

          case 8:
            // this test should never be executed, but will obviously fail human error
            // causes this not to throw
            expect(true).toBe(false);
            _context4.next = 18;
            break;

          case 11:
            _context4.prev = 11;
            _context4.t0 = _context4["catch"](5);

            expect(_context4.t0.message).toBe("Request Error");
            expect(_context4.t0.body).toBe("This is an error");
            expect(_context4.t0.headers).toEqual({});
            expect(_context4.t0.httpVersion).toBe("1.1");
            expect(_context4.t0.statusCode).toBe(500);

          case 18:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, undefined, [[5, 11]]);
  })));

  it("Should return an error object if throwFailures is not set", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var client, mockErrorResponse, result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            expect.assertions(1);
            client = new HttpToS3();

            getHttpStream.mockReturnValueOnce(Promise.resolve({ statusCode: 500 }));
            mockErrorResponse = {
              success: false,
              body: "This is an error",
              headers: {},
              httpVersion: "1.1",
              statusCode: 500
            };

            handleHttpError.mockReturnValueOnce(Promise.resolve(mockErrorResponse));

            _context5.next = 7;
            return client.request("https://example.com");

          case 7:
            result = _context5.sent;

            expect(result).toMatchObject(_extends({
              method: "GET",
              url: "https://example.com"
            }, mockErrorResponse));

          case 9:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  })));
});

describe("Post method", function () {
  it("Should set the method correctly", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    var client, spy, url;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            expect.assertions(1);

            client = new HttpToS3();
            // Set the request method to a simple jest fn so we can capture its calls

            spy = jest.fn();

            client.request = spy;

            url = "https://example.com";
            _context6.next = 7;
            return client.post(url);

          case 7:
            expect(spy).toHaveBeenCalledWith(url, expect.objectContaining({ request: { method: "POST" } }), undefined);

          case 8:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  })));

  it("Should pass through options and body", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
    var client, spy, url;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            expect.assertions(1);

            client = new HttpToS3();
            // Set the request method to a simple jest fn so we can capture its calls

            spy = jest.fn();

            client.request = spy;

            url = "https://example.com";
            _context7.next = 7;
            return client.post(url, { request: { someOtherParam: "test" } }, "bodystring");

          case 7:
            expect(spy).toHaveBeenCalledWith(url, expect.objectContaining({
              request: { method: "POST", someOtherParam: "test" }
            }), "bodystring");

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  })));
});

describe("Get method", function () {
  it("Should set the method correctly", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
    var client, spy, url;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            expect.assertions(1);

            client = new HttpToS3();
            // Set the request method to a simple jest fn so we can capture its calls

            spy = jest.fn();

            client.request = spy;

            url = "https://example.com";
            _context8.next = 7;
            return client.get(url);

          case 7:
            expect(spy).toHaveBeenCalledWith(url, expect.objectContaining({ request: { method: "GET" } }));

          case 8:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, undefined);
  })));

  it("Should pass through options and body", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
    var client, spy, url;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            expect.assertions(1);

            client = new HttpToS3();
            // Set the request method to a simple jest fn so we can capture its calls

            spy = jest.fn();

            client.request = spy;

            url = "https://example.com";
            _context9.next = 7;
            return client.get(url, { request: { someOtherParam: "test" } });

          case 7:
            expect(spy).toHaveBeenCalledWith(url, expect.objectContaining({
              request: { method: "GET", someOtherParam: "test" }
            }));

          case 8:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, undefined);
  })));
});