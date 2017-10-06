"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("babel-polyfill");

var _require = require("aws-sdk"),
    S3 = _require.S3;

var getHttpStream = require("./lib/getHttpStream");
var streamToS3 = require("./lib/streamToS3");
var handleHttpError = require("./lib/handleHttpError");

var _require2 = require("url"),
    URL = _require2.URL;

var HttpToS3 = function () {
  function HttpToS3() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, HttpToS3);

    var s3 = options.s3,
        s3Region = options.s3Region,
        throwFailures = options.throwFailures;


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

      var s3options = {};
      if (s3Region) s3options.region = s3Region;

      this.S3Client = new S3(s3options);
    }
  }

  _createClass(HttpToS3, [{
    key: "request",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var body = arguments[2];
        var parsedUrl, userOptions, requestOptions, response, parsedError, method, error;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // Expect options to have request options under the key request and s3
                // options under the key s3

                // Create a full request option object from the URL and the options object
                parsedUrl = new URL(url);

                // Only http/https supported

                if (!(parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:')) {
                  _context.next = 3;
                  break;
                }

                throw new Error("Unsupported protocol " + parsedUrl.protocol);

              case 3:
                userOptions = options.request || {};
                requestOptions = _extends({
                  port: parsedUrl.port,
                  protocol: parsedUrl.protocol,
                  host: parsedUrl.host,
                  path: parsedUrl.pathname + parsedUrl.search
                }, userOptions);
                _context.next = 7;
                return getHttpStream(requestOptions, body);

              case 7:
                response = _context.sent;

                if (!(response.statusCode > 299)) {
                  _context.next = 21;
                  break;
                }

                _context.next = 11;
                return handleHttpError(response);

              case 11:
                parsedError = _context.sent;
                method = requestOptions.method || "GET";

                if (!this.throwFailures) {
                  _context.next = 20;
                  break;
                }

                error = new Error("Request Error");

                error.body = parsedError.body;
                error.headers = parsedError.headers;
                error.httpVersion = parsedError.httpVersion;
                error.statusCode = parsedError.statusCode;
                throw error;

              case 20:
                return _context.abrupt("return", _extends({ method: method, url: url }, parsedError));

              case 21:
                _context.next = 23;
                return streamToS3(response, this.S3Client, options.s3);

              case 23:
                return _context.abrupt("return", _context.sent);

              case 24:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function request(_x2) {
        return _ref.apply(this, arguments);
      }

      return request;
    }()

    // GET and POST convenience methods, just provides a default method and passes
    // the rest through to request

  }, {
    key: "post",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var body = arguments[2];
        var postOptions;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                postOptions = options;
                // Some object cleansing

                if (!postOptions.request) postOptions.request = {};
                postOptions.request.method = 'POST';

                _context2.next = 5;
                return this.request(url, postOptions, body);

              case 5:
                return _context2.abrupt("return", _context2.sent);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function post(_x4) {
        return _ref2.apply(this, arguments);
      }

      return post;
    }()
  }, {
    key: "get",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(url) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var getOptions;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                getOptions = options;

                if (!getOptions.request) getOptions.request = {};
                getOptions.request.method = 'GET';

                _context3.next = 5;
                return this.request(url, getOptions);

              case 5:
                return _context3.abrupt("return", _context3.sent);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function get(_x6) {
        return _ref3.apply(this, arguments);
      }

      return get;
    }()
  }]);

  return HttpToS3;
}();

module.exports = HttpToS3;