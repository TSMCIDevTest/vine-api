const axios = require("axios");
const fs = require("fs");
const path = require("path");

class VineAPI {
  constructor({ baseURL = "https://api.vineapp.com", token = null } = {}) {
    this.client = axios.create({
      baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    this.channels = {
      getFeatured: () => this._get("/channels/featured"),
      getPopular: () => this._get("/channels/popular"),
      getById: (id) => this._get(`/channels/${this._normalizeId(id)}`),
    };

    this.posts = {
      get: (id) => this._get(`/posts/${this._normalizeId(id)}`),
      like: (id) => this._post(`/posts/${this._normalizeId(id)}/likes`),
      comment: (id, text) =>
        this._post(`/posts/${this._normalizeId(id)}/comments`, { text }),
    };

    this.users = {
      me: () => this._get("/users/me"),
      get: (id) => this._get(`/users/${this._normalizeId(id)}`),
      followers: (id) => this._get(`/users/${this._normalizeId(id)}/followers`),
      following: (id) => this._get(`/users/${this._normalizeId(id)}/following`),
    };

    this.uploads = {
      video: (filePath) => this._uploadVideo(filePath),
    };
  }

  // --- helpers ---
  async _get(endpoint, config = {}) {
    const { data } = await this.client.get(endpoint, config);
    return data;
  }

  async _post(endpoint, body = {}, config = {}) {
    const { data } = await this.client.post(endpoint, body, config);
    return data;
  }

  async _uploadVideo(filePath) {
    const fileData = fs.readFileSync(path.resolve(filePath));
    const { headers } = await this.client.put("/uploads", fileData, {
      headers: { "Content-Type": "video/mp4" },
    });
    return headers["x-upload-key"];
  }

  _normalizeId(input) {
    if (typeof input !== "string") return input;
    // handle vine:// urls
    const match = input.match(/vine:\/\/(?:post|user|channel)\/(\w+)/i);
    return match ? match[1] : input;
  }
}

module.exports = VineAPI;
