// Give the module an implementation so it returns an object with
// jest functions
jest.mock("follow-redirects", () => ({
  http: {
    request: jest.fn()
  },
  https: {
    request: jest.fn()
  }
}));

const { http, https } = require("follow-redirects");
const getHttpStream = require("./getHttpStream");

describe("getHttpStream", () => {
  beforeEach(() => {
    // Clear the mocks calls before each test
    http.request.mockClear();
    https.request.mockClear();
  });

  it("Should reject if there are connection errors", async () => {
    expect.assertions(1);

    const error = new Error("TCP Drop");
    https.request.mockImplementationOnce(() => {
      throw error; // just throw a fake error to test if it bubbles up
    });

    try {
      await getHttpStream({ protocol: "https:" });
    } catch (e) {
      expect(e).toBe(error);
    }
  });

  it("Should send plain http requests", async () => {
    expect.assertions(2);

    const write = jest.fn();
    http.request.mockImplementationOnce((options, cb) => {
      // Add some async to keep the promise from being immediately resolved
      setTimeout(() => {
        cb({
          statusCode: 200,
        });
      }, 10);
      // also need to immediately return a shell with the write, on, end funcs
      return {
        write,
        on: jest.fn(),
        end: jest.fn(),
      }
    });

    await getHttpStream({ protocol: "http:" });
    expect(http.request).toHaveBeenCalledWith(
      { protocol: "http:" },
      expect.any(Function)
    );
    expect(https.request).not.toHaveBeenCalled();
  });

  it("Should send https requests", async () => {
    expect.assertions(2);

    const write = jest.fn();
    https.request.mockImplementationOnce((options, cb) => {
      setTimeout(() => {
        cb({
          statusCode: 200,
        });
      }, 10);
      return {
        write,
        on: jest.fn(),
        end: jest.fn(),
      }
    });

    await getHttpStream({ protocol: "https:" });
    expect(https.request).toHaveBeenCalledWith(
      { protocol: "https:" },
      expect.any(Function)
    );
    expect(http.request).not.toHaveBeenCalled();
  });

  it("Should write the body if present", async () => {
    expect.assertions(3);

    const write = jest.fn();
    https.request.mockImplementationOnce((options, cb) => {
      setTimeout(() => {
        cb({
          statusCode: 200,
        });
      }, 10);
      return {
        write,
        on: jest.fn(),
        end: jest.fn(),
      }
    });

    await getHttpStream({ protocol: "https:" }, 'bodystring');
    expect(https.request).toHaveBeenCalledWith(
      { protocol: "https:" },
      expect.any(Function)
    );
    expect(write).toHaveBeenCalledWith('bodystring');
    expect(http.request).not.toHaveBeenCalled();
  });


});
