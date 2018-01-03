const streamToS3 = require("./streamToS3");

// Create a simple fake client to use
const fakeClient = {
  upload: jest.fn()
};

// The only thing to really test here is if the callback resolves / rejects correctly
describe("streamToS3", () => {
  it("Should upload the stream", async () => {
    expect.assertions(2);
    fakeClient.upload.mockImplementationOnce((params, opts) => {
      return {
        on() { return this },
        send(cb) {
          cb(null, { success: true });
        }
      };
    });

    const result = await streamToS3("body", fakeClient, {
      Bucket: "test-bucket",
      Key: "test-key"
    });

    // Ensure that the s3 upload is being called with the right params
    expect(fakeClient.upload).toHaveBeenCalledWith(
      {
        Body: "body",
        Bucket: "test-bucket",
        Key: "test-key"
      },
      { partSize: 10 * 1024 * 1024, queueSize: 1 },
    );

    expect(result).toEqual({ success: true });
  });

  it("Should reject on error", async () => {
    expect.assertions(1);
    const mockError = new Error("S3 Error");

    fakeClient.upload.mockImplementationOnce((params, opts) => {
      return {
        on() { return this },
        send(cb) {
          cb(mockError);
        }
      };
    });

    try {
      await streamToS3("body", fakeClient);
    } catch (e) {
      expect(e).toBe(mockError);
    }
  });

  it("Should call optional httpUploadProgress", async () => {
    expect.assertions(3);
    fakeClient.upload.mockImplementationOnce((params, opts) => {
      return {
        on(_, fn) {
          fn();
          return this;
        },
        send(cb) {
          cb(null, { success: true });
        }
      };
    });
    const mockHttpUploadProgress = jest.fn();

    const result = await streamToS3("body", fakeClient, {
      Bucket: "test-bucket",
      Key: "test-key",
      httpUploadProgress: mockHttpUploadProgress,
    });

    // Ensure that the s3 upload is being called with the right params
    expect(fakeClient.upload).toHaveBeenCalledWith(
      {
        Body: "body",
        Bucket: "test-bucket",
        Key: "test-key",
      },
      { partSize: 10 * 1024 * 1024, queueSize: 1 },
    );

    expect(mockHttpUploadProgress).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });
});
