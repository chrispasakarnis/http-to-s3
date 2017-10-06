"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var streamToPromise = require("stream-to-promise");
// Streams the response body, and packages it in an object with some extra
// request metadata
module.exports = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(errorStream) {
    var headers, httpVersion, statusCode, error, errorText;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            headers = errorStream.headers, httpVersion = errorStream.httpVersion, statusCode = errorStream.statusCode;
            _context.next = 3;
            return streamToPromise(errorStream);

          case 3:
            error = _context.sent;
            // returns a buffer

            // We're assuming utf8, but we could parameterize this to handle other encodings
            errorText = error.toString("utf8");
            return _context.abrupt("return", { success: false, body: errorText, headers: headers, httpVersion: httpVersion, statusCode: statusCode });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();