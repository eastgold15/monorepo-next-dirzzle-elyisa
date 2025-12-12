/**
 * 通用文件上传相关的类型定义
 */

import { Type as t } from "@sinclair/typebox";
import { MediaTModel } from "./media.t.model";
import { MediaMetaTModel } from "./meta.t.model";

// 文件上传状态
export const UploadStatus = t.Union([
  t.Literal("pending"), // 等待上传
  t.Literal("uploading"), // 上传中
  t.Literal("success"), // 上传成功
  t.Literal("error"), // 上传失败
]);

export type UploadStatus = typeof UploadStatus.static;

// 上传配置
export const UploadConfig = t.Object({
  category: t.String(), // 文件分类（如：avatar, product, document等）
  mediaType: MediaTModel.FileType, // 媒体类型
  multiple: t.Optional(t.Boolean()), // 是否允许多文件
  maxSize: t.Optional(t.Number()), // 最大文件大小（字节）
  maxFiles: t.Optional(t.Number()), // 最大文件数量
  accept: t.Optional(t.String()), // 接受的文件类型
});

export type UploadConfig = typeof UploadConfig.static;

// 上传文件信息
export const UploadFile = t.Object({
  id: t.String(),
  file: t.Unknown(), // File 对象
  name: t.String(),
  size: t.Number(),
  type: t.String(),
  preview: t.Optional(t.String()),
  progress: t.Number(),
  status: UploadStatus,
  error: t.Optional(t.String()),
});

export type UploadFile = typeof UploadFile.static;

// 上传请求参数
export const UploadRequest = t.Object({
  media: t.Object({
    storageKey: t.String(),
    userId: t.String(),
    originalName: t.String(),
    mimeType: t.String(),
    category: t.String(),
  }),
  meta: MediaMetaTModel.Create,
});

export type UploadRequest = typeof UploadRequest.static;

// 上传响应
export const UploadResponse = t.Object({
  id: t.String(),
  storageKey: t.String(),
  url: t.String(),
  originalName: t.String(),
  mimeType: t.String(),
  category: t.String(),
});

export type UploadResponse = typeof UploadResponse.static;

// 导出所有类型
export const UploadTModel = {
  UploadStatus,
  UploadConfig,
  UploadFile,
  UploadRequest,
  UploadResponse,
} as const;

export type UploadTModel = {
  UploadStatus: UploadStatus;
  UploadConfig: UploadConfig;
  UploadFile: UploadFile;
  UploadRequest: UploadRequest;
  UploadResponse: UploadResponse;
};