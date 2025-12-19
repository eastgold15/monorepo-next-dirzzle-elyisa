import { MediaContract, mediaTable } from "@repo/contract";
import { and, eq, inArray } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { StorageFactory } from "~/lib/media/storage/StorageFactory";
import { authGuardMid } from "~/middleware/auth";
import { mediaService } from "~/modules/index";

export const mediaController = new Elysia({ prefix: "/media", tags: ["Media"] })
  .use(authGuardMid)
  .use(dbPlugin)

  // 上传文件
  .post(
    "/upload",
    async ({ body, set, user, currentSite, status, db }) => {
      try {
        const file = body.file;
        const { category = "general" } = body;

        if (!file) {
          set.status = 400;
          return status(400, "请选择要上传的文件");
        }

        if (!currentSite) {
          set.status = 400;
          return status(400, "请先选择站点");
        }

        // 使用存储工厂上传文件
        const storage = StorageFactory.createStorageFromEnv();

        // 生成唯一的文件名
        const fileName = file.name || "unknown";
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const uniqueName = `${timestamp}_${randomStr}_${fileName}`;

        // 上传到存储
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
        throw new HttpError.InternalServerError(
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
        summary: "上传媒体文件",
        description: "上传文件到当前站点，支持多种文件类型",
        tags: ["Media"],
      },
    }
  )

  // 获取文件列表（包含业务逻辑）
  .get(
    "/list",
    async ({ query, db, currentSite }) => {
      const { category, search } = query;

      if (!currentSite) {
        throw new Error("请先选择站点");
      }

      const files = await db.query.mediaTable.findMany({
        where: {
          ...(category ? { category } : {}),
          ...(search ? { originalName: { like: `%${search}%` } } : {}),
          siteId: currentSite.id,
        },
        orderBy: { createdAt: "desc" },
      });

      // 添加 URL
      const storage = StorageFactory.createStorageFromEnv();
      const filesWithUrls = files.map((file) => ({
        ...file,
        url: storage.getPublicUrl(file.storageKey),
      }));

      return filesWithUrls;
    },
    {
      query: t.Object({
        category: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
      detail: {
        summary: "获取媒体文件列表",
        description: "获取当前站点的所有媒体文件，支持分类和搜索过滤",
        tags: ["Media"],
      },
    }
  )

  // 标准的 CRUD 操作
  .get(
    "/",
    ({ query, permissions, auth }) => {
      if (!permissions.includes("MEDIA_VIEW")) throw new Error("Forbidden");
      return mediaService.findAll(query, auth);
    },
    {
      query: MediaContract.ListQuery,
      detail: {
        summary: "获取媒体文件分页列表",
        description: "分页获取媒体文件列表，支持复杂的查询条件",
        tags: ["Media"],
      },
    }
  )

  .patch(
    "/:id",
    ({ params, body, permissions, auth }) => {
      if (!permissions.includes("MEDIA_EDIT")) throw new Error("Forbidden");
      return mediaService.update(params.id, body, auth);
    },
    {
      params: t.Object({ id: t.String() }),
      body: MediaContract.Patch,
      detail: {
        summary: "更新媒体文件信息",
        description: "更新媒体文件的元数据信息，如分类、名称等",
        tags: ["Media"],
      },
    }
  )

  // 删除文件（包含业务逻辑）
  .delete(
    "/:id",
    async ({ params, set, user, currentSite, db }) => {
      try {
        const { id } = params;

        // 查询文件信息
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
          throw new HttpError.NotFound("文件不存在");
        }

        // 检查权限
        if (fileRecord.siteId !== currentSite.id) {
          set.status = 403;
          throw new HttpError.Forbidden("没有权限删除此文件");
        }

        // 从存储删除文件
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
        throw new HttpError.InternalServerError(
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
          "删除指定文件（包括存储和数据库记录），只能删除自己站点的文件",
        tags: ["Media"],
      },
    }
  )

  // 批量删除文件
  .post(
    "/batch-delete",
    async ({ body, db, currentSite, permissions }) => {
      if (!permissions.includes("MEDIA_DELETE")) {
        throw new HttpError.Forbidden("没有删除权限");
      }

      const { ids } = body;

      // 查询所有要删除的文件
      const files = await db.query.mediaTable.findMany({
        where: {
          id: { in: ids },
          siteId: currentSite.id,
        },
      });

      if (files.length === 0) {
        throw new HttpError.NotFound("没有找到可删除的文件");
      }

      // 从存储删除文件
      const storage = StorageFactory.createStorageFromEnv();
      await Promise.all(
        files.map((file) => storage.deleteFile(file.storageKey))
      );

      // 从数据库删除记录
      await db
        .delete(mediaTable)
        .where(
          and(
            eq(mediaTable.siteId, currentSite.id),
            inArray(mediaTable.id, ids)
          )
        );

      return {
        message: `成功删除 ${files.length} 个文件`,
        count: files.length,
      };
    },
    {
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除媒体文件",
        description: "一次性删除多个文件，只能删除当前站点的文件",
        tags: ["Media"],
      },
    }
  );
