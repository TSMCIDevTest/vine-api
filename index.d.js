declare module "vine-api" {
  interface VineAPIOptions {
    baseURL?: string;
    token?: string | null;
  }

  class VineAPI {
    constructor(options?: VineAPIOptions);

    channels: {
      getFeatured(): Promise<any>;
      getPopular(): Promise<any>;
      getById(id: string): Promise<any>;
    };

    posts: {
      get(id: string): Promise<any>;
      like(id: string): Promise<any>;
      comment(id: string, text: string): Promise<any>;
    };

    users: {
      me(): Promise<any>;
      get(id: string): Promise<any>;
      followers(id: string): Promise<any>;
      following(id: string): Promise<any>;
    };

    uploads: {
      video(filePath: string): Promise<any>;
    };
  }

  export = VineAPI;
}
