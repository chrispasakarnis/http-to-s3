const { Readable } = require("stream");
const handleHttpError = require('./handleHttpError');

describe("handleHttpError", () => {
  it("Should return an error", async () => {
    // Since we're expecting a stream, we need to create a Readble stream and
    // push some data into it
    // See: https://github.com/substack/stream-handbook for more details on streams
    const rs = new Readable();
    rs.statusCode = 500;
    rs.httpVersion = '1.1';
    rs.headers = {};
    rs._read = () => {
      rs.push("Server Error");
      rs.push(null);
    };

    expect.assertions(1);

    const error = await handleHttpError(rs);
    expect(error).toMatchObject({
      success: false,
      body: 'Server Error',
      headers: {},
      httpVersion: '1.1',
      statusCode: 500,
    });

  });
});
