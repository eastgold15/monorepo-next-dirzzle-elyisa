/**
 * ✍️ 【B2B Service - 业务自定义】
 */
import { and, eq, inArray, like, type SQL, sql } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { StorageFactory } from "~/lib/media/storage/StorageFactory";
import { MediaGeneratedService } from "../_generated/media.service";
import type { ServiceContext } from "../_lib/base-service";

export class MediaService extends MediaGeneratedService {
  /**
   * 🛡️ 核心：处理文件上传逻辑
   * 利用基类的 create 方法自动注入 siteId 和 factoryId
   */

  async upload(file: File, ctx: ServiceContext, category = "general") {
    const storage = StorageFactory.createStorageFromEnv();

    // 1. 生成唯一文件名
    const fileName = file.name || "unknown";
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${fileName}`;

    // 2. 物理上传
    const uploadResult = await storage.uploadFile(
      file,
      uniqueName,
      category,
      file.type
    );

    // 3. 调用基类 create 方法
    // 基类会自动从 ctx.auth 中提取 siteId 和 factoryId 并注入到 values 中
    return await this.create(
      {
        url: uploadResult.url || "",
        storageKey: uploadResult.key || uniqueName,
        originalName: fileName,
        mimeType: file.type,
        category,
        isPublic: true,
        status: true,
      },
      ctx
    );
  }

  /**
   * 🛡️ 核心：获取列表
   * withScope 会自动根据当前登录人是"出口商"还是"工厂"添加不同的 WHERE 条件
   */
  async getMediaList(
    query: { category?: string; search?: string; ids?: string[] },
    ctx: ServiceContext
  ) {
    console.debug("query:", query);
    try {
      const filters: SQL[] = [];
      const table = this.table as any;

      if (query.category) filters.push(eq(table.category, query.category));
      if (query.search)
        filters.push(like(table.originalName, `%${query.search}%`));
      if (query.ids && query.ids.length > 0)
        filters.push(inArray(table.id, query.ids));

      const select = ctx.db.select().from(this.table).$dynamic();

      // 自动注入隔离：工厂用户只能看到自己工厂的，出口商看到全站的
      const files = await this.withScope(select, ctx, filters).orderBy(
        sql`${table.createdAt} desc`
      );

      const storage = StorageFactory.createStorageFromEnv();
      return files.map((file: any) => ({
        ...file,
        url: storage.getPublicUrl(file.storageKey),
      }));
    } catch (error) {
      console.log("error:", error);
    }
  }

  /**
   * 🛡️ 核心：物理删除
   */
  async deletePhysical(id: string, ctx: ServiceContext) {
    // 1. 先查出记录（withScope 确保只能查到属于自己的数据，实现越权检查）
    const select = ctx.db.select().from(this.table).$dynamic();
    const [file] = await this.withScope(select, ctx, [
      eq((this.table as any).id, id),
    ]);

    if (!file) throw new HttpError.NotFound("文件不存在或无权访问");

    // 2. 删除物理文件
    const storage = StorageFactory.createStorageFromEnv();
    await storage.deleteFile(file.storageKey);

    // 3. 调用基类删除方法
    return await this.delete(id, ctx);
  }

  /**
   * 🛡️ 核心：批量物理删除
   */
  async batchDeletePhysical(ids: string[], ctx: ServiceContext) {
    // 1. 查找所有属于当前 Scope 的文件
    const select = ctx.db.select().from(this.table).$dynamic();
    const files = await this.withScope(select, ctx, [
      inArray((this.table as any).id, ids),
    ]);

    if (files.length === 0) throw new HttpError.NotFound("未找到可删除的文件");

    // 2. 物理删除
    const storage = StorageFactory.createStorageFromEnv();
    await Promise.all(files.map((f: any) => storage.deleteFile(f.storageKey)));

    // 3. 数据库批量删除（手动补全 scope 确保安全）
    await ctx.db.delete(this.table).where(
      and(
        inArray(
          (this.table as any).id,
          files.map((f: any) => f.id)
        ),
        ...this.getScopeFilters(ctx)
      )
    );

    return { count: files.length };
  }
}
