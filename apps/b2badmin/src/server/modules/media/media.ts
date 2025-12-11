/**
 * 媒体文件管理控制器
 * 统一处理媒体文件相关的HTTP请求
 * 整合了原upload和image控制器的功能
 */

import { FILE_TYPE, MediaModel } from "@repo/contract";
import { Elysia, t } from "elysia";
import { z } from "zod/v4";

import MediaService from "./media.service";
import { dbPlugin } from "@/server/db/connection";
import { commonRes } from "@/server/utils/Res";

/**
 * 媒体文件管理控制器
 * 提供完整的媒体文件管理API，包括上传、删除、查询等功能
 */
export const mediaRoute = new Elysia({
  prefix: "/media",
  tags: ["Media"],
})
  .use(dbPlugin)

  // ========================= 上传相关 =========================

  // 单文件上传
  .post(
    "/upload",
    async ({ body }) => {
      const { file, ...options } = body;
      const result = await MediaService.uploadFromFile(file, options);
      return commonRes(result);
    },
    {
      body: MediaModel.UploadFileDto,
      detail: {
        summary: "上传单个媒体文件",
        description: "上传单个媒体文件到指定文件夹，支持多种文件类型",
      },
    }
  )

  // 批量文件上传
  .post(
    "/upload/batch",
    async ({ body }) => {
      const { files, ...options } = body;
      const result = await MediaService.uploadFromFiles(files, options);
      return commonRes(result);
    },
    {
      body: MediaModel.UploadFilesDto,
      detail: {
        summary: "批量上传媒体文件",
        description: "批量上传多个媒体文件到指定文件夹",
      },
    }
  )

  // ========================= 查询相关 =========================

  // 分页获取媒体文件列表
  .get(
    "/",
    async ({ query }) => {
      const result = await MediaService.getList(query);
      return commonRes(result);
    },
    {
      query: MediaModel.ListQuery,
      detail: {
        summary: "获取媒体文件列表",
        description: "获取媒体文件列表，支持分类筛选、文件类型筛选、搜索和分页",
      },
    }
  )

  // 获取单个媒体文件信息
  .get(
    "/item/:id",
    async ({ params }) => {
      const result = await MediaService.getById(params.id);
      return commonRes(result);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "获取单个媒体文件信息",
        description: "根据ID获取媒体文件的详细信息",
      },
    }
  )

  // 根据分类获取媒体文件
  .get(
    "/category/:category",
    async ({ params }) => {
      const result = await MediaService.findByCategory(params.category);
      return commonRes(result);
    },
    {
      params: t.Object({
        category: t.String(),
      }),
      detail: {
        summary: "根据分类获取媒体文件",
        description: "获取指定分类的所有媒体文件",
      },
    }
  )

  // 根据文件夹获取媒体文件
  .get(
    "/folder/:folder",
    async ({ params }) => {
      const result = await MediaService.findByFolder(params.folder);
      return commonRes(result);
    },
    {
      params: t.Object({
        folder: t.String(),
      }),
      detail: {
        summary: "根据文件夹获取媒体文件",
        description: "获取指定文件夹的所有媒体文件",
      },
    }
  )

  // 根据文件类型获取媒体文件
  .get(
    "/type/:fileType",
    async ({ params }) => {
      const result = await MediaService.findByFileType(params.fileType);
      return commonRes(result);
    },
    {
      params: t.Object({
        fileType: t.UnionEnum([
          FILE_TYPE.IMAGE,
          FILE_TYPE.VIDEO,
          FILE_TYPE.DOCUMENT,
          FILE_TYPE.AUDIO,
          FILE_TYPE.OTHER,
        ]),
      }),
      detail: {
        summary: "根据文件类型获取媒体文件",
        description: "获取指定文件类型的所有媒体文件",
      },
    }
  )

  // 搜索媒体文件
  .get(
    "/search",
    async ({ query }) => {
      const { q, limit = 50 } = query;
      const result = await MediaService.search(q, limit);
      return commonRes(result);
    },
    {
      query: t.Object({
        q: t.String({ description: "搜索关键词" }),
        limit: t.Numeric({ default: 50, description: "返回结果数量限制" }),
      }),
      detail: {
        summary: "搜索媒体文件",
        description: "根据关键词搜索媒体文件，支持文件名、描述、标签等字段",
      },
    }
  )

  // ========================= 更新相关 =========================

  // 更新媒体文件信息
  .put(
    "/item/:id",
    async ({ params, body }) => {
      const result = await MediaService.update(params.id, body);
      return commonRes(result);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: MediaModel.Patch,
      detail: {
        summary: "更新媒体文件信息",
        description: "更新媒体文件的基本信息（不包括文件本身）",
      },
    }
  )

  // 批量更新媒体文件信息
  .put(
    "/batch",
    async ({ body }) => {
      const { ids, updates } = body;
      const results = await Promise.all(
        ids.map((id) => MediaService.update(id, updates))
      );
      return commonRes(results);
    },
    {
      body: MediaModel.BatchUpdate,
      detail: {
        summary: "批量更新媒体文件信息",
        description: "批量更新多个媒体文件的基本信息",
      },
    }
  )

  // ========================= 删除相关 =========================

  // 删除单个媒体文件（包括存储文件）
  .delete(
    "/item/:id",
    async ({ params }) => {
      const result = await MediaService.deleteWithFile(params.id);
      return commonRes(result);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "删除单个媒体文件",
        description: "删除媒体文件记录和对应的存储文件",
      },
    }
  )

  // 批量删除媒体文件
  .delete(
    "/batch",
    async ({ body }) => {
      const { ids } = body;
      const result = await MediaService.deleteBatchWithFiles(ids);
      return commonRes(
        null,
        204,
        `成功删除 ${result.success} 个文件，失败 ${result.failed} 个`
      );
    },
    {
      body: MediaModel.BatchDelete,
      detail: {
        summary: "批量删除媒体文件",
        description: "批量删除多个媒体文件记录和对应的存储文件",
      },
    }
  )

  // 仅删除数据库记录（不删除存储文件）
  .delete(
    "/item/:id/record-only",
    async ({ params }) => {
      const result = await MediaService.delete(params.id);
      return commonRes(result);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "仅删除数据库记录",
        description: "仅删除媒体文件的数据库记录，不删除存储文件",
      },
    }
  )

  // ========================= 工具相关 =========================

  // 检查文件是否存在
  .get(
    "/exists",
    async ({ query }) => {
      const { url, storageType } = query;
      if (!url) {
        return {
          success: false,
          error: "文件URL不能为空",
        };
      }
      const result = await MediaService.fileExists(url, storageType as any);
      return commonRes(result);
    },
    {
      query: t.Object({
        url: t.String({ description: "文件URL或Key" }),
        storageType: t.Optional(t.UnionEnum(["local", "oss", "s3"])),
      }),
      detail: {
        summary: "检查文件是否存在",
        description: "检查指定URL的文件在存储中是否存在",
      },
    }
  )

  // 获取存储中的文件信息
  .get(
    "/storage/info",
    async ({ query }) => {
      const { url, storageType } = query;
      if (!url) {
        return {
          success: false,
          error: "文件URL不能为空",
        };
      }
      const result = await MediaService.getStorageFileInfo(
        url,
        storageType as any
      );
      return commonRes(result);
    },
    {
      query: t.Object({
        url: t.String({ description: "文件URL或Key" }),
        storageType: t.Optional(t.UnionEnum(["local", "oss", "s3"])),
      }),
      detail: {
        summary: "获取存储文件信息",
        description: "获取文件在存储系统中的详细信息",
      },
    }
  )

  // 获取存储提供者信息
  .get(
    "/storage/provider",
    ({ query }) => {
      const { storageType } = query;
      const result = MediaService.getProviderInfo(storageType as any);
      return commonRes(result);
    },
    {
      query: t.Object({
        storageType: t.Optional(t.UnionEnum(["local", "oss", "s3"])),
      }),
      detail: {
        summary: "获取存储提供者信息",
        description: "获取当前或指定存储提供者的详细信息",
      },
    }
  )

  // ========================= 批量操作相关 =========================

  // 批量获取媒体文件详情
  .get(
    "/batch/detail",
    async ({ query }) => {
      const { ids } = query;
      const result = await MediaService.getDetailByIds(ids);
      return commonRes(result);
    },
    {
      query: z.object({
        ids: z.array(z.string()),
      }),
      detail: {
        summary: "批量获取媒体文件详情",
        description: "根据ID数组批量获取媒体文件详情",
      },
    }
  );
