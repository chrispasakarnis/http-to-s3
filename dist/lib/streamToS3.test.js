"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var streamToS3 = require("./streamToS3");

// Create a simple fake client to use
var fakeClient = {
  upload: jest.fn()
};

// The only thing to really test here is if the callback resolves / rejects correctly
describe("streamToS3", function () {
  it("Should upload the stream", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            expect.assertions(2);
            fakeClient.upload.mockImplementationOnce(function (params, opts, cb) {
              cb(null, { success: true });
            });

            _context.next = 4;
            return streamToS3("body", fakeClient, {
              Bucket: "test-bucket",
              Key: "test-key"
            });

          case 4:
            result = _context.sent;


            // Ensure that the s3 upload is being called with the right params
            expect(fakeClient.upload).toHaveBeenCalledWith({
              Body: "body",
              Bucket: "test-bucket",
              Key: "test-key"
            }, { partSize: 10 * 1024 * 1024, queueSize: 1 }, expect.any(Function));

            expect(result).toEqual({ success: true });

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  it("Should reject on error", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var mockError;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            expect.assertions(1);
            mockError = new Error("S3 Error");

            fakeClient.upload.mockImplementationOnce(function (params, opts, cb) {
              cb(mockError);
            });
            _context2.prev = 3;
            _context2.next = 6;
            return streamToS3("body", fakeClient);

          case 6:
            _context2.next = 11;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](3);

            expect(_context2.t0).toBe(mockError);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[3, 8]]);
  })));
});