declare module "vine-api" {
  export interface VineAPIOptions {
    baseURL?: string;
    headers?: Record<string, string>;
  }

  export interface VineResponse<T = any> {
    code?: string;
    data: T;
    success?: boolean;
    error?: string;
    [k: string]: any;
  }

  export interface Channel {
    channelId: number;
    channel: string;
    iconUrl: string;
    retinaIconUrl: string;
  }

  export interface User {
    username: string;
    verified: boolean | number;
    vanityUrls: string[];
    avatarUrl: string;
    userId: number;
    following: number;
    profileBackground: string;
    user: { private: number };
    location: string;
  }

  export interface PostEntity {
    type: "mention" | string;
    id: number;
    text: string;
    range: [number, number];
  }

  export interface CreatePostRequest {
    videoUrl: string;
    thumbnailUrl: string;
    description: string;
    entities: PostEntity[];
    foursquareVenueId?: string;
    venueName?: string;
    channelId?: number;
  }

  class VineAPI {
    constructor(options?: VineAPIOptions);

    channels: {
      getFeatured(): Promise<VineResponse<{ count: number; anchorStr?: string; records: Channel[] }>>;
      getTimeline(channelId: number | string, opts?: Record<string, any>): Promise<VineResponse>;
    };

    posts: {
      getLikes(postId: string): Promise<VineResponse<{ count: number; records: User[] }>>;
      like(postId: string): Promise<VineResponse>;
      create(data: CreatePostRequest): Promise<VineResponse>;
    };

    uploads: {
      video(filePath: string, appVersion?: string): Promise<string>;
      thumbnail(filePath: string, appVersion?: string): Promise<string>;
      avatar(filePath: string, appVersion?: string): Promise<string>;
    };

    users: {
      getFollowers(userId: string | number): Promise<VineResponse<{ count: number; records: User[] }>>;
      getFollowing(userId: string | number): Promise<VineResponse<{ count: number; records: User[] }>>;
      follow(userId: string | number): Promise<VineResponse>;
      unfollow(userId: string | number): Promise<VineResponse>;
      getProfile(userId: string | number): Promise<VineResponse<User>>;
    };

    timelines: {
      popularNow(): Promise<VineResponse>;
      trendingPeople(): Promise<VineResponse>;
      editorsPicks(): Promise<VineResponse>;
      tag(tag: string): Promise<VineResponse>;
      post(postId: string): Promise<VineResponse>;
      user(userId: string | number): Promise<VineResponse>;
      venue(venueId: string): Promise<VineResponse>;
      channel(channelId: string | number, opts?: Record<string, any>): Promise<VineResponse>;
    };

    resolveDeepLink(uri: string): Promise<VineResponse>;
  }

  export default VineAPI;
}
