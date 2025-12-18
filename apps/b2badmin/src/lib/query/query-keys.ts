export const queryKeys = {
  // Auth
  me: () => ["me"] as const,

  // Users
  users: () => ["users"] as const,
  user: (id: string) => ["users", id] as const,

  // Categories
  categories: {
    all: () => ["categories"] as const,
    desc: (id: string) => ["categories", id] as const,
    list: () => ["categories", "list"] as const,
    tree: () => ["categories", "tree"] as const,
  },

  // Ads
  ads: {
    all: () => ["ads"] as const,
    current: () => ["ads", "current"] as const,
  },

  // Hero Cards
  heroCards: {
    all: () => ["hero-cards"] as const,
    current: () => ["hero-cards", "current"] as const,
  },

  media: {
    url: (id: string) => ["media", "url", id] as const,
    urls: (ids: string[]) => ["media", "urls", ids] as const,
  },

  uploads: {
    presignedUrl: (filename: string, contentType: string) =>
      ["uploads", "presigned-url", filename, contentType] as const,
    // 或更安全：用 MD5 代替 filename
    presignedUrlByHash: (hash: string) =>
      ["uploads", "presigned-url", hash] as const,
  },
};
