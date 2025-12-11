/**
 * 媒体文件管理服务
 * 统一管理所有类型的媒体文件（图片、视频、文档等）
 * 整合了原 UploadsService 和 ImageService 的功能
 */

import { FILE_TYPE, type FileType, type MediaModel } from "@repo/contract";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { IMAGE_MIME_TYPE_MAP } from "~/utils/constant";
import { HttpError } from "~/utils/err";
import { db } from "../../lib/db/connection";
import { mediaTable } from "../../lib/db/schema";
import { StorageFactory, type StorageType } from "./storage";
import type { AbstractImageStorage } from "./storage/ImageStorage";

/**
 * 媒体文件管理服务
 * 统一的媒体文件管理接口，支持多种存储后端和文件类型
 */
export const MediaService = {
  table: mediaTable,

  /**
   * 获取当前使用的存储实例
   */
  getStorage(
    storageType?: StorageType,
    config?: Record<string, any>
  ): AbstractImageStorage {
    if (storageType) {
      return StorageFactory.createStorage(storageType, config);
    }
    return StorageFactory.createStorageFromEnv();
  },

  /**
   * 获取存储提供者信息
   */
  getProviderInfo(storageType?: StorageType) {
    const storage = this.getStorage(storageType);
    return storage.getProviderInfo();
  },

  /**
   * 检测文件类型
   */
  detectFileType(mimeType: string): FileType {
    if (mimeType.startsWith("image/")) {
      return FILE_TYPE.IMAGE;
    }
    if (mimeType.startsWith("video/")) {
      return FILE_TYPE.VIDEO;
    }
    if (mimeType.startsWith("audio/")) {
      return FILE_TYPE.AUDIO;
    }
    if (
      mimeType.includes("document") ||
      mimeType.includes("pdf") ||
      mimeType.includes("text") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation")
    ) {
      return FILE_TYPE.DOCUMENT;
    }
    return FILE_TYPE.OTHER;
  },

  /**
   * 上传单个媒体文件并创建数据库记录
   */
  async uploadMedia(
    file: Buffer | Uint8Array | string | Blob,
    originalName: string,
    options: {
      folder?: string;
      category?: string;
      alt?: string;
      description?: string;
      tags?: string;
      isPublic?: boolean;
      entityType?: string;
      entityId?: string;
      storageType?: StorageType;
      storageConfig?: Record<string, any>;
    } = {}
  ): Promise<MediaModel["Entity"]> {
    const {
      folder = "uploads",
      category = "general",
      alt,
      description,
      tags,
      isPublic = true,
      entityType,
      entityId,
      storageType,
      storageConfig,
    } = options;

    // 获取存储实例
    const storage = this.getStorage(storageType, storageConfig);
    const providerInfo = storage.getProviderInfo();

    // 处理文件数据并获取文件信息
    let fileSize = 0;
    const processedFile: Buffer | Uint8Array | string | Blob = file;

    if (file instanceof Blob) {
      fileSize = file.size;
    } else if (Buffer.isBuffer(file) || file instanceof Uint8Array) {
      fileSize = file.length;
    } else if (typeof file === "string") {
      fileSize = Buffer.byteLength(file);
    }

    // 检测内容类型
    const mimeType =
      file instanceof Blob && file.type
        ? file.type
        : this.getMimeTypeFromFileName(originalName);
    const fileType = this.detectFileType(mimeType);

    // 上传到存储
    const uploadResult = await storage.uploadFile(
      processedFile,
      originalName,
      folder,
      mimeType
    );

    // 创建数据库记录
    const mediaRecord = await db
      .insert(this.table)
      .values({
        fileName: uploadResult.fileName,
        originalName,
        url: uploadResult.url,
        key: uploadResult.key || uploadResult.url,
        category,
        folder,
        fileType,
        mimeType,
        fileSize,
        alt: alt || originalName,
        description: description || "",
        tags: tags || "",
        storageProvider: providerInfo.type,
        isPublic,
        entityType: entityType || "",
        entityId: entityId || "",
        createdAt: new Date(),
      })
      .returning();

    if (!mediaRecord[0]) {
      throw new HttpError.InternalServerError("上传失败");
    }

    return mediaRecord[0];
  },

  /**
   * 批量上传媒体文件
   */
  async uploadMediaBatch(
    files: Array<{
      file: Buffer | Uint8Array | string | Blob;
      originalName: string;
    }>,
    options: {
      folder?: string;
      category?: string;
      description?: string;
      tags?: string;
      isPublic?: boolean;
      entityType?: string;
      entityId?: string;
      storageType?: StorageType;
    } = {}
  ): Promise<{
    success: MediaModel["Entity"][];
    failed: Array<{ fileName: string; error: string }>;
  }> {
    const storage = this.getStorage(options.storageType);
    const providerInfo = storage.getProviderInfo();

    const results = await Promise.allSettled(
      files.map(async ({ file, originalName }) => {
        // 处理文件数据
        let fileSize;
        if (file instanceof Blob) {
          fileSize = file.size;
        } else if (Buffer.isBuffer(file) || file instanceof Uint8Array) {
          fileSize = file.length;
        } else {
          fileSize = Buffer.byteLength(file as string);
        }

        const mimeType =
          file instanceof Blob && file.type
            ? file.type
            : this.getMimeTypeFromFileName(originalName);
        const fileType = this.detectFileType(mimeType);

        // 上传文件
        const uploadResult = await storage.uploadFile(
          file,
          originalName,
          options.folder || "uploads",
          mimeType
        );

        // 创建数据库记录
        const mediaRecord = await db
          .insert(this.table)
          .values({
            fileName: uploadResult.fileName,
            originalName,
            url: uploadResult.url,
            key: uploadResult.key || uploadResult.url,
            category: options.category || "general",
            folder: options.folder || "uploads",
            fileType,
            mimeType,
            fileSize,
            alt: originalName,
            description: options.description || "",
            tags: options.tags || "",
            storageProvider: providerInfo.type,
            isPublic: options.isPublic ?? true,
            entityType: options.entityType || "",
            entityId: options.entityId || "",
            createdAt: new Date(),
          })
          .returning();

        if (!mediaRecord[0]) {
          throw new HttpError.InternalServerError("上传失败");
        }

        return mediaRecord[0];
      })
    );

    const success: MediaModel["Entity"][] = [];
    const failed: Array<{ fileName: string; error: string }> = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        success.push(result.value);
      } else {
        failed.push({
          fileName: files[index]?.originalName || "未知文件",
          error: result.reason?.message || "上传失败",
        });
      }
    });

    return { success, failed };
  },

  /**
   * 从Elysia File对象上传单个文件
   */
  async uploadFromFile(
    file: File,
    options: {
      folder?: string;
      category?: string;
      alt?: string;
      description?: string;
      tags?: string;
      isPublic?: boolean;
      entityType?: string;
      entityId?: string;
      storageType?: StorageType;
    } = {}
  ): Promise<MediaModel["Entity"]> {
    return this.uploadMedia(
      new Uint8Array(await file.arrayBuffer()),
      file.name,
      {
        ...options,
        folder: options.folder || file.name,
      }
    );
  },

  /**
   * 从Elysia File对象批量上传文件
   */
  async uploadFromFiles(
    files: File[],
    options: {
      folder?: string;
      category?: string;
      description?: string;
      tags?: string;
      isPublic?: boolean;
      entityType?: string;
      entityId?: string;
      storageType?: StorageType;
    } = {}
  ): Promise<{
    success: MediaModel["Entity"][];
    failed: Array<{ fileName: string; error: string }>;
  }> {
    const fileData = await Promise.all(
      files.map(async (file) => ({
        file: new Uint8Array(await file.arrayBuffer()),
        originalName: file.name,
      }))
    );

    return this.uploadMediaBatch(fileData, options);
  },

  /**
   * 更新媒体文件信息
   */
  async update(
    id: string,
    data: Partial<MediaModel["Update"]>
  ): Promise<MediaModel["Entity"]> {
    const [result] = await db
      .update(this.table)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(this.table.id, id))
      .returning();

    if (!result) {
      throw new HttpError.NotFound("媒体文件不存在");
    }

    return result;
  },

  /**
   * 删除媒体文件（包括存储文件和数据库记录）
   */
  async deleteWithFile(
    id: string,
    storageType?: StorageType
  ): Promise<boolean> {
    return await db.transaction(async (tx) => {
      // 获取媒体文件信息
      const media = await this.getById(id);
      if (!media) {
        throw new HttpError.NotFound("媒体文件不存在");
      }

      // 从存储删除文件
      const storage = this.getStorage(storageType);
      const fileKey = media.key || media.url;
      if (fileKey) {
        await storage.deleteFile(fileKey).catch(() => {
          // 存储文件删除失败，继续删除数据库记录
          console.warn(`存储文件删除失败: ${fileKey}`);
        });
      }

      // 删除数据库记录
      const deleteResult = await tx
        .delete(this.table)
        .where(eq(this.table.id, id))
        .returning({ id: this.table.id });

      return deleteResult.length > 0;
    });
  },

  /**
   * 批量删除媒体文件
   */
  async deleteBatchWithFiles(ids: string[], storageType?: StorageType) {
    // 获取所有媒体文件信息
    const mediaList = await this.getDetailByIds(ids);
    const storage = this.getStorage(storageType);

    // 批量删除存储文件
    const deletePromises = mediaList.map(async (media) => {
      try {
        const fileKey = media.key || media.url;
        if (fileKey) {
          await storage.deleteFile(fileKey);
        }
        return { success: true, id: media.id };
      } catch (error) {
        return { success: false, id: media.id, error };
      }
    });

    const storageResults = await Promise.allSettled(deletePromises);
    let storageSuccess = 0;
    const storageErrors: string[] = [];

    storageResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        if (result.value.success) storageSuccess++;
      } else {
        const fileName = mediaList[index]?.fileName || "未知文件";
        storageErrors.push(
          `${fileName}: ${result.reason?.message || "删除失败"}`
        );
      }
    });

    // 批量删除数据库记录
    const dbResult = await db
      .delete(this.table)
      .where(inArray(this.table.id, ids))
      .returning({ id: this.table.id });

    const dbSuccess = dbResult.length;
    const failed = ids.length - dbSuccess;

    return {
      success: dbSuccess,
      failed,
      errors: storageErrors,
    };
  },

  /**
   * 仅删除数据库记录（不删除存储文件）
   */
  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning({ id: this.table.id });

    return result.length > 0;
  },

  // ========================= 查询方法 =========================

  /**
   * 分页获取媒体文件列表
   */
  async getList(query: MediaModel["ListQuery"]) {
    const {
      page = 1,
      limit = 12,
      sort = "createdAt",
      sortOrder = "desc",
      search,
      category,
      folder,
      fileType,
      mimeType,
      storageProvider,
      isPublic,
      entityType,
      entityId,
    } = query;

    // 构建查询条件
    const conditions: any[] = [];

    if (search) {
      conditions.push(
        ilike(this.table.alt, `%${search}%`),
        ilike(this.table.originalName, `%${search}%`),
        ilike(this.table.description, `%${search}%`)
      );
    }

    if (category) {
      conditions.push(eq(this.table.category, category));
    }

    if (folder) {
      conditions.push(eq(this.table.folder, folder));
    }

    if (fileType) {
      conditions.push(eq(this.table.fileType, fileType));
    }

    if (mimeType) {
      conditions.push(eq(this.table.mimeType, mimeType));
    }

    if (storageProvider) {
      conditions.push(eq(this.table.storageProvider, storageProvider));
    }

    if (typeof isPublic === "boolean") {
      conditions.push(eq(this.table.isPublic, isPublic));
    }

    if (entityType) {
      conditions.push(eq(this.table.entityType, entityType));
    }

    if (entityId) {
      conditions.push(eq(this.table.entityId, entityId));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // 处理排序
    const sortFieldMap: Record<string, any> = {
      id: this.table.id,
      fileName: this.table.fileName,
      originalName: this.table.originalName,
      category: this.table.category,
      folder: this.table.folder,
      fileType: this.table.fileType,
      fileSize: this.table.fileSize,
      mimeType: this.table.mimeType,
      storageProvider: this.table.storageProvider,
      createdAt: this.table.createdAt,
      updatedAt: this.table.updatedAt,
    };

    const sortField = sortFieldMap[sort] || this.table.createdAt;
    const orderDirection = sortOrder === "desc" ? desc : asc;
    const offset = (page - 1) * limit;

    // 并行执行查询
    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(this.table)
        .where(whereCondition)
        .orderBy(orderDirection(sortField))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql`count(*)` })
        .from(this.table)
        .where(whereCondition),
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      items: data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  /**
   * 根据ID获取媒体文件详情
   */
  async getById(id: string): Promise<MediaModel["Entity"] | null> {
    const [result] = await db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    return result || null;
  },

  /**
   * 根据ID数组批量获取媒体文件详情
   */
  async getDetailByIds(ids: string[]): Promise<MediaModel["Entity"][]> {
    const results = await db
      .select()
      .from(this.table)
      .where(inArray(this.table.id, ids));

    return results;
  },

  /**
   * 根据分类查询媒体文件
   */
  async findByCategory(category: string): Promise<MediaModel["Entity"][]> {
    const results = await db
      .select()
      .from(this.table)
      .where(eq(this.table.category, category))
      .orderBy(desc(this.table.createdAt));

    return results;
  },

  /**
   * 根据文件夹查询媒体文件
   */
  async findByFolder(folder: string): Promise<MediaModel["Entity"][]> {
    const results = await db
      .select()
      .from(this.table)
      .where(eq(this.table.folder, folder))
      .orderBy(desc(this.table.createdAt));

    return results;
  },

  /**
   * 根据文件类型查询媒体文件
   */
  async findByFileType(fileType: string): Promise<MediaModel["Entity"][]> {
    const results = await db
      .select()
      .from(this.table)
      .where(eq(this.table.fileType, fileType))
      .orderBy(desc(this.table.createdAt));

    return results;
  },

  /**
   * 搜索媒体文件
   */
  async search(
    searchTerm: string,
    limit = 50
  ): Promise<MediaModel["Entity"][]> {
    const results = await db
      .select()
      .from(this.table)
      .where(
        or(
          ilike(this.table.alt, `%${searchTerm}%`),
          ilike(this.table.originalName, `%${searchTerm}%`),
          ilike(this.table.description, `%${searchTerm}%`)
        )
      )
      .orderBy(desc(this.table.createdAt))
      .limit(limit);

    return results;
  },

  /**
   * 检查文件是否存在
   */
  async fileExists(
    urlOrKey: string,
    storageType?: StorageType
  ): Promise<boolean> {
    try {
      const storage = this.getStorage(storageType);
      return await storage.fileExists(urlOrKey);
    } catch (error) {
      return false;
    }
  },

  /**
   * 获取存储中的文件信息
   */
  async getStorageFileInfo(urlOrKey: string, storageType?: StorageType) {
    try {
      const storage = this.getStorage(storageType);
      return await storage.getFileInfo(urlOrKey);
    } catch (error) {
      throw new HttpError.InternalServerError(
        `获取存储文件信息失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  },

  // ========================= 工具方法 =========================

  /**
   * 从文件名获取MIME类型
   */
  getMimeTypeFromFileName(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
    return IMAGE_MIME_TYPE_MAP[extension] || "application/octet-stream";
  },
};

export default MediaService;
