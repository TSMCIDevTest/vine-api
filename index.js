const axios = require("axios");
const fs = require("fs");
const path = require("path");

/**
 * @module VineAPI
 */

/**
 * Options for VineAPI
 * @typedef {Object} VineAPIOptions
 * @property {string} [baseURL="https://api.vineapp.com"] - Base API URL
 * @property {Record<string,string>} [headers] - Extra headers (e.g., auth)
 */
class VineAPI {
  /**
   * @param {VineAPIOptions} [options]
   */
  constructor({ baseURL = "https://api.vineapp.com", headers = {} } = {}) {
    this.api = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    /** -------- Channels -------- */
    /**
     * @namespace channels
     */
    this.channels = {
      /**
       * GET /channels/featured
       * @returns {Promise<any>}
       */
      getFeatured: () => this._get("/channels/featured"),

      /**
       * Channel timeline
       * e.g., GET /channels/:channelId  (opts are passed as query)
       * @param {string|number} channelId
       * @param {Object} [opts]
       * @returns {Promise<any>}
       */
      getTimeline: (channelId, opts = {}) =>
        this._get(`/channels/${this._normalizeId(channelId)}`, { params: opts }),
    };

    /** -------- Posts -------- */
    /**
     * @namespace posts
     */
    this.posts = {
      /**
       * GET /posts/:id/likes
       * @param {string} id post id or vine://post/:id
       * @returns {Promise<any>}
       */
      getLikes: (id) => this._get(`/posts/${this._normalizeId(id)}/likes`),

      /**
       * POST /posts/:id/likes
       * @param {string} id post id or vine://post/:id
       * @returns {Promise<any>}
       */
      like: (id) => this._post(`/posts/${this._normalizeId(id)}/likes`),

      /**
       * POST /posts
       * @param {Object} data - { videoUrl, thumbnailUrl, description, entities, [foursquareVenueId], [venueName], [channelId] }
       * @returns {Promise<any>}
       */
      create: (data) => this._post("/posts", data),
    };

    /** -------- Uploads -------- */
    /**
     * @namespace uploads
     */
    this.uploads = {
      /**
       * PUT /videos/upload/:appVersion.mp4
       * @param {string} filePath local mp4 path
       * @param {string} [appVersion="7.0.0"]
       * @returns {Promise<string>} X-Upload-Key header (final video URL)
       */
      video: (filePath, appVersion = "7.0.0") =>
        this._upload(`/videos/upload/${appVersion}.mp4`, filePath, "video/mp4"),

      /**
       * PUT /videos/thumbs/:appVersion.mp4.jpg
       * @param {string} filePath local jpg path
       * @param {string} [appVersion="7.0.0"]
       * @returns {Promise<string>} X-Upload-Key header (final thumbnail URL)
       */
      thumbnail: (filePath, appVersion = "7.0.0") =>
        this._upload(
          `/videos/thumbs/${appVersion}.mp4.jpg`,
          filePath,
          "image/jpeg"
        ),

      /**
       * PUT /videos/avatar/:appVersion.jpg
       * @param {string} filePath local jpg path
       * @param {string} [appVersion="7.0.0"]
       * @returns {Promise<string>} X-Upload-Key header (final avatar URL)
       */
      avatar: (filePath, appVersion = "7.0.0") =>
        this._upload(`/videos/avatar/${appVersion}.jpg`, filePath, "image/jpeg"),
    };

    /** -------- Users -------- */
    /**
     * @namespace users
     */
    this.users = {
      /**
       * GET /users/:id/followers
       * @param {string|number} userId id or vine://user-id/:id
       */
      getFollowers: (userId) =>
        this._get(`/users/${this._normalizeUser(userId)}/followers`),

      /**
       * GET /users/:id/following
       * @param {string|number} userId id or vine://user-id/:id
       */
      getFollowing: (userId) =>
        this._get(`/users/${this._normalizeUser(userId)}/following`),

      /**
       * POST /users/:id/followers
       * @param {string|number} userId id or vine://user-id/:id
       */
      follow: (userId) =>
        this._post(`/users/${this._normalizeUser(userId)}/followers`),

      /**
       * DELETE /users/:id/followers
       * @param {string|number} userId id or vine://user-id/:id
       */
      unfollow: (userId) =>
        this._delete(`/users/${this._normalizeUser(userId)}/followers`),

      /**
       * GET /users/:id
       * @param {string|number} userId id or vine://user-id/:id
       */
      getProfile: (userId) => this._get(`/users/${this._normalizeUser(userId)}`),
    };

    /** -------- Timelines (deep-link equivalents) -------- */
    /**
     * @namespace timelines
     */
    this.timelines = {
      /** vine://popular-now → GET /timelines/popular-now */
      popularNow: () => this._get("/timelines/popular-now"),
      /** vine://trending-people → GET /timelines/trending-people */
      trendingPeople: () => this._get("/timelines/trending-people"),
      /** vine://editors-picks → GET /timelines/editors-picks */
      editorsPicks: () => this._get("/timelines/editors-picks"),
      /** vine://tag/:tag → GET /timelines/tag/:tag */
      tag: (tag) => this._get(`/timelines/tag/${encodeURIComponent(tag)}`),
      /** vine://post/:id → GET /timelines/post/:id (single post timeline) */
      post: (postId) => this._get(`/timelines/post/${this._normalizeId(postId)}`),
      /** vine://user-id/:id → GET /timelines/user-id/:id */
      user: (userId) => this._get(`/timelines/user-id/${this._normalizeUser(userId)}`),
      /** vine://venue/:venueId → GET /timelines/venue/:id */
      venue: (venueId) => this._get(`/timelines/venue/${this._normalizeId(venueId)}`),
      /** vine://channels/:id?... → same as channels.getTimeline */
      channel: (channelId, opts = {}) =>
        this.channels.getTimeline(channelId, opts),
    };
  }

  // ------------------ Public helper: resolve any vine:// URL ------------------

  /**
   * Resolve a vine:// deep link into the appropriate API call and run it.
   * Supports:
   * - vine://popular-now
   * - vine://trending-people
   * - vine://editors-picks
   * - vine://tag/:tag
   * - vine://post/:id
   * - vine://user-id/:id
   * - vine://venue/:id
   * - vine://channels/:id?name=...&navRGB=...&titleRGB=...
   * @param {string} uri
   * @returns {Promise<any>}
   */
  async resolveDeepLink(uri) {
    if (!/^vine:\/\//i.test(uri)) {
      throw new Error("Not a vine:// URI");
    }
    const u = new URL(uri.replace(/^vine:\/\//i, "vine://")); // ensure URL parses
    const host = u.host.toLowerCase();
    const path = (u.pathname || "").replace(/^\/+/, "");

    switch (host) {
      case "popular-now":
        return this.timelines.popularNow();
      case "trending-people":
        return this.timelines.trendingPeople();
      case "editors-picks":
        return this.timelines.editorsPicks();
      case "tag":
        return this.timelines.tag(decodeURIComponent(path));
      case "post":
        return this.timelines.post(path);
      case "user-id":
        return this.timelines.user(path);
      case "venue":
        return this.timelines.venue(path);
      case "channels": {
        const id = path;
        const opts = Object.fromEntries(u.searchParams.entries());
        return this.timelines.channel(id, opts);
      }
      default:
        throw new Error(`Unsupported vine:// host: ${host}`);
    }
  }

  // ------------------ Internal HTTP helpers ------------------

  async _get(url, config = {}) {
    const res = await this.api.get(url, config);
    return res.data;
  }

  async _post(url, data = {}, config = {}) {
    const res = await this.api.post(url, data, config);
    return res.data;
  }

  async _delete(url, config = {}) {
    const res = await this.api.delete(url, config);
    return res.data;
  }

  async _upload(url, filePath, contentType) {
    const fileData = fs.readFileSync(path.resolve(filePath));
    const res = await this.api.put(url, fileData, {
      headers: { "Content-Type": contentType },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    return res.headers["x-upload-key"];
  }

  // ------------------ ID normalizers ------------------

  _normalizeId(input) {
    if (typeof input !== "string") return input;
    const m =
      input.match(/^vine:\/\/(?:post|channels?|venue)\/([^/?#]+)/i) ||
      input.match(/^vine:\/\/([^/]+)\/([^/?#]+)/i);
    if (m) return m[1] && m[2] ? m[2] : m[1]; // second group if available
    return input;
  }

  _normalizeUser(input) {
    if (typeof input !== "string") return input;
    const m = input.match(/^vine:\/\/user-id\/([^/?#]+)/i);
    return m ? m[1] : input;
  }
}

module.exports = VineAPI;
