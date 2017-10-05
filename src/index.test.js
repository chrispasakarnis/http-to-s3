// Mock out our modules with side-effects
jest.mock("./lib/getHttpStream");
jest.mock("./lib/streamToS3");
jest.mock("./lib/handleHttpError");

const HttpToS3 = require("./index");
const getHttpStream = require("./lib/getHttpStream");
const streamToS3 = require("./lib/streamToS3");
const handleHttpError = require("./lib/handleHttpError");
const { S3 } = require("aws-sdk");

describe("Class constructor", () => {
  it("Should set a default for throwFailures", () => {
    expect.assertions(1);
    const client = new HttpToS3();
    expect(client.throwFailures).toBe(false);
  });

  it("Should set throwFailures", () => {
    expect.assertions(1);
    const client = new HttpToS3({ throwFailures: true });
    expect(client.throwFailures).toBe(true);
  });

  it("Should throw if provided an invalid S3 client", () => {
    expect.assertions(1);
    expect(() => {
      new HttpToS3({ s3: {} });
    }).toThrow("Invalid S3 client provided");
  });

  it("Should set the S3 client if provided", () => {
    expect.assertions(1);
    const sampleS3 = new S3();
    const client = new HttpToS3({ s3: sampleS3 });
    expect(client.S3Client).toBe(sampleS3);
  });

  it("Should create an S3 client if none provided", () => {
    expect.assertions(1);
    const client = new HttpToS3();
    expect(client.S3Client).toBeInstanceOf(S3);
  });

  it("Should set the S3 region if provided", () => {
    expect.assertions(2);
    const client = new HttpToS3({ s3Region: "us-west-1" });
    expect(client.S3Client).toBeInstanceOf(S3);
    expect(client.S3Client.config.region).toBe("us-west-1");
  });
});

describe("request method", () => {
  it("Should successfully stream to S3", async () => {
    expect.assertions(1);

    const mockS3Return = {
      ETag: '"d71816d724ec0cbd97cecb03814bffe2"',
      Location: "https://sample-bucket.s3.amazonaws.com/file.txt",
      key: "file.txt",
      Key: "file.txt",
      Bucket: "sample-bucket"
    };

    const client = new HttpToS3();
    getHttpStream.mockReturnValueOnce(Promise.resolve({ statusCode: 200 }));
    streamToS3.mockReturnValueOnce(Promise.resolve(mockS3Return));
    const result = await client.request("https://example.com");
    expect(result).toBe(mockS3Return);
  });

  it("Should throw if protocol is unsupported", async () => {
    expect.assertions(1);

    const client = new HttpToS3();
    try {
      await client.request("ssh://example.com");
    } catch (e) {
      expect(e.message).toBe('Unsupported protocol ssh:');
    }
  });

  it("Should set request parameters correctly", async () => {
    expect.assertions(1);
    const client = new HttpToS3();
    getHttpStream.mockReturnValueOnce(Promise.resolve({ statusCode: 200 }));
    const options = {
      request: {
        port: 8443,
        someOtherParam: "parameter"
      }
    };
    const body = "test-body";
    await client.request("https://example.com", options, body);
    expect(getHttpStream).toHaveBeenCalledWith(
      {
        port: 8443,
        protocol: "https:",
        host: "example.com",
        path: "/",
        someOtherParam: "parameter"
      },
      body
    );
  });

  it("Should throw errors if throwFailures is set", async () => {
    expect.assertions(5);
    const client = new HttpToS3({ throwFailures: true });
    getHttpStream.mockReturnValueOnce(Promise.resolve({ statusCode: 500 }));
    const mockErrorResponse = {
      success: false,
      body: "This is an error",
      headers: {},
      httpVersion: "1.1",
      statusCode: 500
    };
    handleHttpError.mockReturnValueOnce(Promise.resolve(mockErrorResponse));

    // We could use Jest's toThrow() expectation, but by manually catching the
    // the error, we can easily test the extra values that are attached to it
    try {
      await client.request("https://example.com");
      // this test should never be executed, but will obviously fail human error
      // causes this not to throw
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe("Request Error");
      expect(e.body).toBe("This is an error");
      expect(e.headers).toEqual({});
      expect(e.httpVersion).toBe("1.1");
      expect(e.statusCode).toBe(500);
    }
  });

  it("Should return an error object if throwFailures is not set", async () => {
    expect.assertions(1);
    const client = new HttpToS3();
    getHttpStream.mockReturnValueOnce(Promise.resolve({ statusCode: 500 }));
    const mockErrorResponse = {
      success: false,
      body: "This is an error",
      headers: {},
      httpVersion: "1.1",
      statusCode: 500
    };
    handleHttpError.mockReturnValueOnce(Promise.resolve(mockErrorResponse));

    const result = await client.request("https://example.com");
    expect(result).toMatchObject({
      method: "GET",
      url: "https://example.com",
      ...mockErrorResponse
    });
  });
});

describe("Post method", () => {
  it("Should set the method correctly", async () => {
    expect.assertions(1);

    const client = new HttpToS3();
    // Set the request method to a simple jest fn so we can capture its calls
    const spy = jest.fn();
    client.request = spy;

    const url = "https://example.com";
    await client.post(url);
    expect(spy).toHaveBeenCalledWith(
      url,
      expect.objectContaining({ request: { method: "POST" } }),
      undefined
    );
  });

  it("Should pass through options and body", async () => {
    expect.assertions(1);

    const client = new HttpToS3();
    // Set the request method to a simple jest fn so we can capture its calls
    const spy = jest.fn();
    client.request = spy;

    const url = "https://example.com";
    await client.post(
      url,
      { request: { someOtherParam: "test" } },
      "bodystring"
    );
    expect(spy).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        request: { method: "POST", someOtherParam: "test" }
      }),
      "bodystring"
    );
  });
});

describe("Get method", () => {
  it("Should set the method correctly", async () => {
    expect.assertions(1);

    const client = new HttpToS3();
    // Set the request method to a simple jest fn so we can capture its calls
    const spy = jest.fn();
    client.request = spy;

    const url = "https://example.com";
    await client.get(url);
    expect(spy).toHaveBeenCalledWith(
      url,
      expect.objectContaining({ request: { method: "GET" } })
    );
  });

  it("Should pass through options and body", async () => {
    expect.assertions(1);

    const client = new HttpToS3();
    // Set the request method to a simple jest fn so we can capture its calls
    const spy = jest.fn();
    client.request = spy;

    const url = "https://example.com";
    await client.get(
      url,
      { request: { someOtherParam: "test" } }
    );
    expect(spy).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        request: { method: "GET", someOtherParam: "test" }
      })
    );
  });
});
