"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Give the module an implementation so it returns an object with
// jest functions
jest.mock("follow-redirects", function () {
  return {
    http: {
      request: jest.fn()
    },
    https: {
      request: jest.fn()
    }
  };
});

var _require = require("follow-redirects"),
    http = _require.http,
    https = _require.https;

var getHttpStream = require("./getHttpStream");

describe("getHttpStream", function () {
  beforeEach(function () {
    // Clear the mocks calls before each test
    http.request.mockClear();
    https.request.mockClear();
  });

  it("Should reject if there are connection errors", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var error;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            expect.assertions(1);

            error = new Error("TCP Drop");

            https.request.mockImplementationOnce(function () {
              throw error; // just throw a fake error to test if it bubbles up
            });

            _context.prev = 3;
            _context.next = 6;
            return getHttpStream({ protocol: "https:" });

          case 6:
            _context.next = 11;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](3);

            expect(_context.t0).toBe(error);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[3, 8]]);
  })));

  it("Should send plain http requests", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var write;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            expect.assertions(2);

            write = jest.fn();

            http.request.mockImplementationOnce(function (options, cb) {
              // Add some async to keep the promise from being immediately resolved
              setTimeout(function () {
                cb({
                  statusCode: 200
                });
              }, 10);
              // also need to immediately return a shell with the write, on, end funcs
              return {
                write: write,
                on: jest.fn(),
                end: jest.fn()
              };
            });

            _context2.next = 5;
            return getHttpStream({ protocol: "http:" });

          case 5:
            expect(http.request).toHaveBeenCalledWith({ protocol: "http:" }, expect.any(Function));
            expect(https.request).not.toHaveBeenCalled();

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  it("Should send https requests", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    var write;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            expect.assertions(2);

            write = jest.fn();

            https.request.mockImplementationOnce(function (options, cb) {
              setTimeout(function () {
                cb({
                  statusCode: 200
                });
              }, 10);
              return {
                write: write,
                on: jest.fn(),
                end: jest.fn()
              };
            });

            _context3.next = 5;
            return getHttpStream({ protocol: "https:" });

          case 5:
            expect(https.request).toHaveBeenCalledWith({ protocol: "https:" }, expect.any(Function));
            expect(http.request).not.toHaveBeenCalled();

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  })));

  it("Should write the body if present", _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    var write;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            expect.assertions(3);

            write = jest.fn();

            https.request.mockImplementationOnce(function (options, cb) {
              setTimeout(function () {
                cb({
                  statusCode: 200
                });
              }, 10);
              return {
                write: write,
                on: jest.fn(),
                end: jest.fn()
              };
            });

            _context4.next = 5;
            return getHttpStream({ protocol: "https:" }, 'bodystring');

          case 5:
            expect(https.request).toHaveBeenCalledWith({ protocol: "https:" }, expect.any(Function));
            expect(write).toHaveBeenCalledWith('bodystring');
            expect(http.request).not.toHaveBeenCalled();

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  })));
});