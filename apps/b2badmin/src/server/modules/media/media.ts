/**
 * 媒体文件管理控制器
 * 统一处理媒体文件相关的HTTP请求
 * 整合了原upload和image控制器的功能
 */

import { userResourceRolesTable } from "@repo/contract/table";
import { and, count, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db, dbPlugin } from "@/server/db/connection";
import { mediaMetadataTable, mediaTable } from "@/server/db/schema";
import { commonRes } from "@/server/utils/Res";
import { betterAuthPlugin } from "../auth/auth.plugin";
import { StorageFactory } from "./storage/StorageFactory";

// 工具函数：获取用户可访问的工厂ID列表
async function getAccessibleFactoryIds(userId: string): Promise<string[]> {
  // 查询用户关联的工厂
  const userFactories = await db
    .select({
      factoryId: userResourceRolesTable.resourceId,
      isPrimary: userResourceRolesTable.isPrimary,
    })
    .from(userResourceRolesTable)
    .where(
      and(
        eq(userResourceRolesTable.userId, userId),
        eq(userResourceRolesTable.resourceType, "factory")
      )
    );

  return userFactories.map((uf) => uf.factoryId);
}
/**
 * 媒体文件管理控制器
 * 提供完整的媒体文件管理API，包括上传、删除、查询等功能
 */
export const mediaRoute = new Elysia({
  prefix: "/media",
  tags: ["Media"],
})
  .use(dbPlugin)
  .use(betterAuthPlugin)
  // ========================= 上传相关 =========================

  .post(
    "/upload",
    async ({ body, set }) => {
      try {
        // 获取上传的文件
        const file = body.file;
        const { category = "general", userId } = body;

        if (!file) {
          set.status = 400;
          return commonRes(null, 400, "请选择要上传的文件");
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

        // 处理 userId：确保是有效的 UUID 字符串或 null
        const validUserId =
          userId && userId !== "undefined" && userId !== "null" ? userId : null;

        // 记录到数据库
        const [result] = await db
          .insert(mediaTable)
          .values({
            url: uploadResult.url || "",
            storageKey: uploadResult.key || uniqueName,
            userId: validUserId,
            originalName: fileName,
            mimeType: file.type,
            category,
            isPublic: true,
          })
          .returning({ id: mediaTable.id });

        const [mediaMeta] = await db
          .insert(mediaMetadataTable)
          .values({
            fileId: result.id,
            mediaType: "image",
          })
          .returning();

        // 返回结果
        return commonRes({
          url: uploadResult.url,
          originalName: fileName,
          size: uploadResult.size,
          mimeType: uploadResult.contentType,
          category,
          ...mediaMeta,
        });
      } catch (error) {
        console.error("文件上传失败:", error);
        set.status = 500;
        return commonRes(
          null,
          500,
          error instanceof Error ? error.message : "文件上传失败"
        );
      }
    },
    {
      body: t.Object({
        file: t.File(),
        category: t.Optional(t.String()),
        userId: t.Optional(t.String()),
      }),
      detail: {
        summary: "直接上传媒体文件",
        description: "接收文件并上传到 OSS 存储",
      },
      auth: true,
    }
  )

  .post(
    "/file/upload",
    async ({
      body: { file, factoryId, category = "general" },
      set,
      userInfo,
    }) => {
      try {
        // 权限检查：验证用户是否有权限上传到指定工厂
        let targetFactoryId = factoryId;
        if (factoryId) {
          const accessibleFactoryIds = await getAccessibleFactoryIds(
            userInfo.id
          );
          if (!accessibleFactoryIds.includes(factoryId)) {
            set.status = 403;
            return commonRes(null, 403, "没有权限上传到指定工厂");
          }
        } else {
          // 如果没有指定工厂，尝试获取用户的主工厂
          const userFactories = await db
            .select({
              factoryId: userResourceRolesTable.resourceId,
            })
            .from(userResourceRolesTable)
            .$dynamic()
            .where(eq(userResourceRolesTable.userId, userInfo.id))
            .where(eq(userResourceRolesTable.resourceType, "factory"))
            .where(eq(userResourceRolesTable.isPrimary, true))

            .limit(1);

          if (userFactories.length > 0) {
            targetFactoryId = userFactories[0].factoryId;
          }
        }

        // 使用 OSS 存储工厂上传文件
        const storage = StorageFactory.createStorageFromEnv();

        // 生成唯一的文件名
        const fileName = file.name;
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
            userId: userInfo.id,
            factoryId: targetFactoryId,
            originalName: fileName,
            mimeType: file.type,
            category,
            isPublic: true,
          })
          .returning({ id: mediaTable.id });

        const [mediaMeta] = await db
          .insert(mediaMetadataTable)
          .values({
            fileId: result.id,
            mediaType: "image",
          })
          .returning();

        // 返回结果
        return commonRes({
          url: uploadResult.url,
          originalName: fileName,
          size: uploadResult.size,
          mimeType: uploadResult.contentType,
          category,
          ...mediaMeta,
        });
      } catch (error) {
        console.error("文件上传失败:", error);
        set.status = 500;
        return commonRes(
          null,
          500,
          error instanceof Error ? error.message : "文件上传失败"
        );
      }
    },
    {
      body: t.Object({
        file: t.File(),
        category: t.Optional(t.String()),
        factoryId: t.Optional(t.String()),
      }),
      detail: {
        summary: "直接上传媒体文件",
        description: "接收文件并上传到 OSS 存储",
      },
      auth: true,
    }
  )
  // ========================= 删除相关 =========================

  .delete(
    "/:id",
    async ({ params, set }) => {
      try {
        const { id } = params;

        // 查询文件信息
        const [fileRecord] = await db
          .select({
            storageKey: mediaTable.storageKey,
            originalName: mediaTable.originalName,
          })
          .from(mediaTable)
          .where(eq(mediaTable.id, id))
          .limit(1);

        if (!fileRecord) {
          set.status = 404;
          return commonRes(null, 404, "文件不存在");
        }

        // 从 OSS 删除文件
        const storage = StorageFactory.createStorageFromEnv();
        await storage.deleteFile(fileRecord.storageKey);

        // 从数据库删除记录
        await db.delete(mediaTable).where(eq(mediaTable.id, id));

        return commonRes(
          null,
          200,
          `文件 "${fileRecord.originalName}" 删除成功`
        );
      } catch (error) {
        console.error("删除文件失败:", error);
        set.status = 500;
        return commonRes(
          null,
          500,
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
        description: "根据ID删除媒体文件（包括OSS和数据库记录）",
      },
    }
  )

  .get(
    "/list",
    async ({ query, set, userInfo }) => {
      try {
        // 1. 解析查询参数
        const { page = 1, limit = 20, category, search } = query
        const parsedLimit = Number(limit);
        const parsedPage = Number(page);
        const offset = (parsedPage - 1) * parsedLimit;

        // 2. 获取用户可访问的工厂ID列表
        const accessibleFactoryIds = await getAccessibleFactoryIds(userInfo.id);

        // 3. 构建 WHERE 条件

        // 3.1 权限过滤条件 (Permission Filter)
        let permissionCondition;
        if (accessibleFactoryIds.length > 0) {
          // 用户可访问的工厂文件 OR 用户自己上传的文件
          permissionCondition = or(
            inArray(mediaTable.factoryId, accessibleFactoryIds),
            eq(mediaTable.userId, userInfo.id)
          );
        } else {
          // 如果用户没有关联工厂，只能看到自己上传的文件
          permissionCondition = eq(mediaTable.userId, userInfo.id);
        }

        // 3.2 可选的过滤条件 (Category and Search)
        const conditions = [permissionCondition];

        if (category) {
          conditions.push(eq(mediaTable.category, category));
        }

        if (search) {
          // Drizzle 的 ilike 用于 LIKE '%search%'
          conditions.push(ilike(mediaTable.originalName, `%${search}%`));
        }

        const finalWhereClause = and(...conditions);

        // 4. 获取总数 (Count)
        // Drizzle ORM 的 count 函数
        const [{ total }] = await db
          .select({
            total: count(),
          })
          .from(mediaTable)
          .where(finalWhereClause);

        // 5. 获取分页后的文件列表 (Select with Relations, Limit, Offset)
        // 使用 with 联表查询 mediaMetadataTable
        const filesWithMetadata = await db.query.mediaTable.findMany({
          columns: {
            id: true,
            originalName: true,
            mimeType: true,
            category: true,
            storageKey: true,
            createdAt: true,
          },
          with: {

            metadata: {
              columns: {
                mediaType: true,
              },
            },
          },
          where: finalWhereClause,
          orderBy: [sql`${mediaTable.createdAt} DESC`], // 使用 sql 模板进行 DESC 排序
          limit: parsedLimit,
          offset,
        });

        // 6. 格式化结果并添加 URL
        const storage = StorageFactory.createStorageFromEnv();
        const filesWithUrls = filesWithMetadata.map((file: any) => ({
          ...file,
          mediaType: file.metadata?.mediaType || null, // 从联表结果中提取 mediaType
          metadata: undefined, // 移除 metadata 字段
          url: storage.getPublicUrl(file.storageKey),
        }));

        // 7. 返回结果
        return commonRes({
          files: filesWithUrls,
          pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total: Number(total),
            totalPages: Math.ceil(Number(total) / parsedLimit),
          },
        });
      } catch (error) {
        console.error("获取文件列表失败:", error);
        set.status = 500;
        return commonRes(
          null,
          500,
          error instanceof Error ? error.message : "获取文件列表失败"
        );
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        category: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
      detail: {
        summary: "获取媒体文件列表",
        description: "分页获取媒体文件列表，支持分类和搜索过滤",
      },
      auth: true,
    }
  );
