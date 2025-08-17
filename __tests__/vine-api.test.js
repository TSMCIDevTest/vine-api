const VineAPI = require("../index");
const axios = require("axios");
const fs = require("fs");

jest.mock("axios");
jest.mock("fs");

describe("VineAPI wrapper", () => {
  let vine;

  beforeEach(() => {
    axios.create.mockReturnValue(axios);
    vine = new VineAPI({ baseURL: "https://api.vineapp.com" });
  });

  afterEach(() => jest.clearAllMocks());

  test("normalize vine://post/12345 and like", async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    const res = await vine.posts.like("vine://post/12345");
    expect(res.success).toBe(true);
    expect(axios.post).toHaveBeenCalledWith("/posts/12345/likes", {}, {});
  });

  test("featured channels", async () => {
    const mock = { data: { success: true, data: { count: 2, records: [] } } };
    axios.get.mockResolvedValue(mock);
    const res = await vine.channels.getFeatured();
    expect(res).toEqual(mock.data);
    expect(axios.get).toHaveBeenCalledWith("/channels/featured", {});
  });

  test("uploads: video", async () => {
    fs.readFileSync.mockReturnValue(Buffer.from("mp4"));
    axios.put.mockResolvedValue({ headers: { "x-upload-key": "https://cdn.example/video.mp4" } });
    const url = await vine.uploads.video("./foo.mp4");
    expect(url).toBe("https://cdn.example/video.mp4");
  });

  test("resolveDeepLink: vine://tag/funny", async () => {
    const mock = { data: { success: true, data: { records: [] } } };
    axios.get.mockResolvedValue(mock);
    const res = await vine.resolveDeepLink("vine://tag/funny");
    expect(res).toEqual(mock.data);
    expect(axios.get).toHaveBeenCalledWith("/timelines/tag/funny", {});
  });
});
