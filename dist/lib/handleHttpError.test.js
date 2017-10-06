"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require("stream"),
    Readable = _require.Readable;

var handleHttpError = require('./handleHttpError');

describe("handleHttpError", function () {
  it("Should return an error", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var rs, error;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Since we're expecting a stream, we need to create a Readble stream and
            // push some data into it
            // See: https://github.com/substack/stream-handbook for more details on streams
            rs = new Readable();

            rs.statusCode = 500;
            rs.httpVersion = '1.1';
            rs.headers = {};
            rs._read = function () {
              rs.push("Server Error");
              rs.push(null);
            };

            expect.assertions(1);

            _context.next = 8;
            return handleHttpError(rs);

          case 8:
            error = _context.sent;

            expect(error).toMatchObject({
              success: false,
              body: 'Server Error',
              headers: {},
              httpVersion: '1.1',
              statusCode: 500
            });

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));
});