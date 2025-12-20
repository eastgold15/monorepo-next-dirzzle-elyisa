import { t } from "elysia";

// 支持的图片类型
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

// 最大文件大小 (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 图片文件扩展名到MIME类型的映射
export const IMAGE_MIME_TYPE_MAP: Record<string, string> = {
  jpeg: SUPPORTED_IMAGE_TYPES[0],
  jpg: SUPPORTED_IMAGE_TYPES[1],
  png: SUPPORTED_IMAGE_TYPES[2],
  gif: SUPPORTED_IMAGE_TYPES[3],
  webp: SUPPORTED_IMAGE_TYPES[4],
};

// 上传类型枚举
export const FOLDDER_TYPE = {
  ALL: "all",
  GENERAL: "general",
  BANNER: "banner",
  PRODUCT: "product",
  LOGO: "logo",
  USER_AVATAR: "avatar",
  OTHER: "other",
} as const;

export type Folder_Type = keyof typeof FOLDDER_TYPE;
export type SUPPORTED_IMAGE_TYPES = (typeof SUPPORTED_IMAGE_TYPES)[number];

// === 枚举 ===
export const FileType = t.UnionEnum([
  "image",
  "video",
  "document",
  "audio",
  "other",
]);

export type FileType = typeof FileType.static;

// 6. 常量定义
export const STATISTICS_TYPES = {
  // 用户相关统计
  USER_REGISTRATION: "user_registration", // 用户注册
  USER_LOGIN: "user_login", // 用户登录
  USER_ACTIVE: "user_active", // 活跃用户

  // 订单相关统计
  ORDER_CREATE: "order_create", // 订单创建
  ORDER_PAYMENT: "order_payment", // 订单支付
  ORDER_COMPLETE: "order_complete", // 订单完成

  // 商品相关统计
  PRODUCT_VIEW: "product_view", // 商品浏览
  PRODUCT_SEARCH: "product_search", // 商品搜索
  PRODUCT_FAVORITE: "product_favorite", // 商品收藏

  // 收入相关统计
  REVENUE_DAILY: "revenue_daily", // 日收入
  REVENUE_MONTHLY: "revenue_monthly", // 月收入
  REVENUE_YEARLY: "revenue_yearly", // 年收入

  // 流量相关统计
  TRAFFIC_PV: "traffic_pv", // 页面浏览量
  TRAFFIC_UV: "traffic_uv", // 独立访客
  TRAFFIC_SESSION: "traffic_session", // 会话数
} as const;
