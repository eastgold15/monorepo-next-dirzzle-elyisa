/**
 * 媒体文件管理控制器
 * 简化版本：只需要用户登录且有站点ID即可上传
 */

import { mediaTable } from "@repo/contract/table";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "../../plugins/admin-auth.plugin";
import { StorageFactory } from "./storage/StorageFactory";
/**
 * 媒体文件管理控制器
 * 提供完整的媒体文件管理API，包括上传、删除、查询等功能
 */
export const mediaRoute = new Elysia({
  prefix: "/media",
  tags: ["Media"],
})
  .use(dbPlugin)
  .use(adminAuthPlugin)
  // ========================= 上传相关 =========================

  .post(
    "/upload",
    async ({ body, set, user, currentSite, status, db }) => {
      try {
        // 获取上传的文件
        const file = body.file;
        const { category = "general" } = body;

        if (!file) {
          set.status = 400;
          return status(400, "请选择要上传的文件");
        }

        //
        if (!currentSite) {
          set.status = 400;
          return status(400, "请先选择站点");
        }

        // 使用 OSS 存储工厂上传文件
        const storage = StorageFactory.createStorageFromEnv();

        // 生成唯一的文件名
        const fileName = file.name || "unknown";
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const uniqueName = `${timestamp}_${randomStr}_${fileName}`;

        // 上传到 OSS
        const uploadResult = await storage.uploadFile(
          file,
          uniqueName,
          category,
          file.type
        );

        // 记录到数据库
        const [result] = await db
          .insert(mediaTable)
          .values({
            url: uploadResult.url || "",
            storageKey: uploadResult.key || uniqueName,
            siteId: currentSite.id,
            originalName: fileName,
            mimeType: file.type,
            category,
            isPublic: true,
            status: true,
          })
          .returning({ id: mediaTable.id });

        // 返回结果
        return {
          id: result.id,
          url: uploadResult.url,
          originalName: fileName,
          size: uploadResult.size,
          mimeType: uploadResult.contentType,
          category,
          siteId: currentSite.id,
        };
      } catch (error) {
        console.error("文件上传失败:", error);
        set.status = 500;
        throw new Error(
          error instanceof Error ? error.message : "文件上传失败"
        );
      }
    },
    {
      body: t.Object({
        file: t.File(),
        category: t.Optional(t.String()),
      }),
      detail: {
        summary: "上传媒体文件到当前站点",
        description: "接收文件并上传到 OSS 存储，关联到用户当前站点",
      },
      auth: true,
    }
  )
  // ========================= 删除相关 =========================

  .delete(
    "/:id",
    async ({ params, set, user, currentSite, db }) => {
      try {
        const { id } = params;

        // 查询文件信息，确保用户只能删除自己站点的文件
        const [fileRecord] = await db
          .select({
            storageKey: mediaTable.storageKey,
            originalName: mediaTable.originalName,
            siteId: mediaTable.siteId,
          })
          .from(mediaTable)
          .where(eq(mediaTable.id, id))
          .limit(1);

        if (!fileRecord) {
          set.status = 404;
          throw new Error("文件不存在");
        }

        // 检查权限：只能删除自己站点的文件
        if (fileRecord.siteId !== currentSite.id) {
          set.status = 403;
          throw new Error("没有权限删除此文件");
        }

        // 从 OSS 删除文件
        const storage = StorageFactory.createStorageFromEnv();
        await storage.deleteFile(fileRecord.storageKey);

        // 从数据库删除记录
        await db.delete(mediaTable).where(eq(mediaTable.id, id));

        return {
          message: `文件 "${fileRecord.originalName}" 删除成功`,
        };
      } catch (error) {
        console.error("删除文件失败:", error);
        set.status = 500;
        throw new Error(
          error instanceof Error ? error.message : "删除文件失败"
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "删除媒体文件",
        description:
          "根据ID删除媒体文件（包括OSS和数据库记录），只能删除自己站点的文件",
      },
      auth: true,
    }
  )

  .get(
    "/list",
    async ({ query, user, db, currentSite }) => {
      const { category, search } = query;

      if (!currentSite) {
        throw new Error("请先选择站点");
      }
      // 获取所有符合条件的文件
      const files = await db.query.mediaTable.findMany({
        where: {
          ...(category ? { category } : {}),
          ...(search ? { originalName: { like: `%${search}%` } } : {}),
          siteId: currentSite.id
        },
        orderBy: { createdAt: "desc" },
      });

      // 添加 URL
      const storage = StorageFactory.createStorageFromEnv();
      const filesWithUrls = files.map((file) => ({
        ...file,
        url: storage.getPublicUrl(file.storageKey),
      }));

      // 直接返回文件列表，不分页
      return filesWithUrls;
    },
    {
      query: t.Object({
        category: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
      detail: {
        summary: "获取当前站点的媒体文件列表",
        description: "获取当前站点的所有媒体文件，支持分类和搜索过滤",
      },
      auth: true,
    }
  );
