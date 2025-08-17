# vine-api (Unofficial)

[![npm version](https://img.shields.io/npm/v/vine-api.svg)](https://www.npmjs.com/package/vine-api)
[![Codecov](https://codecov.io/gh/TSMCIDevTest/vine-api/branch/main/graph/badge.svg)](https://codecov.io/gh/TSMCIDevTest/vine-api)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://TSMCIDevTest.github.io/vine-api/)

Unofficial Vine App API wrapper for Node.js with `vine://` deep-link support.

## Install
```bash
npm install vine-api
```

## Quick Start
```bash
const VineAPI = require("vine-api");

const vine = new VineAPI({ baseURL: "https://api.vineapp.com" });

// Featured channels
const featured = await vine.channels.getFeatured();

// Like a post — accepts id or vine:// URL
await vine.posts.like("vine://post/1234567890");

// Create a post
await vine.posts.create({
  videoUrl: "https://cdn.example.com/videos/abc.mp4",
  thumbnailUrl: "https://cdn.example.com/thumbs/abc.jpg",
  description: "hello vine!",
  entities: []
});

// Uploads
const videoUrl = await vine.uploads.video("./video.mp4");
const thumbUrl = await vine.uploads.thumbnail("./thumb.jpg");
const avatarUrl = await vine.uploads.avatar("./me.jpg");

// Users
const followers = await vine.users.getFollowers("vine://user-id/123");
await vine.users.follow(123);
await vine.users.unfollow(123);

// Timelines (deep-links)
await vine.timelines.popularNow();
await vine.timelines.tag("funny");
await vine.resolveDeepLink("vine://channels/1?name=Comedy&navRGB=33ccbf&titleRGB=ffffff");
```

## Credits
# Credits to GPT
# Credits to the vine app that is long gone
# Credits to the resource https://github.com/bruhdudeisdead/vine-docs
