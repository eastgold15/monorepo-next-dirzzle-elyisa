/**
 * 本地文件存储策略实现
 * 将文件保存在本地文件系统中
 * 基于新的 AbstractStorage 基类
 */

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { basename, extname, join } from "node:path";
import { IMAGE_MIME_TYPE_MAP } from "@repo/contract";
import { AbstractStorage } from "./AbstractStorage";

type LocalStorageConfig = {
  baseDir?: string; // 基础存储目录，默认 'public/uploads'
  baseUrl?: string; // 基础访问URL，默认 '/uploads'
  maxFileSize?: number; // 最大文件大小，默认 10MB
};

export class LocalStorage extends AbstractStorage {
  private readonly baseDir: string;
  private readonly baseUrl: string;
  private readonly maxFileSize: number;

  constructor(config: LocalStorageConfig = {}) {
    super(config);
    this.baseDir = config.baseDir || "public/uploads";
    this.baseUrl = config.baseUrl || "/uploads";
    this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB

    // 确保基础目录存在
    this.ensureDirectoryExists(this.baseDir);
  }

  async uploadFile(
    file: Buffer | Uint8Array | string | Blob,
    originalName: string,
    folder: string,
    contentType?: string
  ): Promise<{
    url: string;
    fileName: string;
    size: number;
    contentType: string;
    key?: string;
  }> {
    try {
      const { body, size } = await this.processFileData(file);

      // 文件大小验证
      if (!this.validateFileSize(size, this.maxFileSize)) {
        throw new Error(
          `文件大小超过限制: ${(this.maxFileSize / 1024 / 1024).toFixed(2)}MB`
        );
      }

      // 确定内容类型
      const finalContentType =
        contentType || this.getContentTypeFromFileName(originalName);

      // 生成文件路径
      const relativePath = this.generateUniqueFileName(originalName, folder);
      const fullPath = join(this.baseDir, relativePath);

      // 确保目录存在
      const directory = join(this.baseDir, folder);
      await this.ensureDirectoryExists(directory);

      // 写入文件
      await fs.writeFile(fullPath, body);

      // 生成访问 URL
      const url = `${this.baseUrl}/${relativePath}`;

      return {
        url,
        fileName: originalName,
        size,
        contentType: finalContentType,
        key: relativePath, // 本地存储使用相对路径作为 key
      };
    } catch (error) {
      throw new Error(
        `本地文件上传失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  async uploadFileDirect(
    file: Buffer | Uint8Array | string | Blob,
    key: string,
    contentType = "application/octet-stream"
  ): Promise<{
    key: string;
    url: string;
    [key: string]: any;
  }> {
    try {
      const { body } = await this.processFileData(file);
      const fullPath = join(this.baseDir, key);

      // 确保目录存在
      const directory = join(
        this.baseDir,
        key.split("/").slice(0, -1).join("/")
      );
      await this.ensureDirectoryExists(directory);

      // 写入文件
      await fs.writeFile(fullPath, body);

      return {
        key,
        url: `${this.baseUrl}/${key}`,
        size: body.length,
      };
    } catch (error) {
      throw new Error(
        `本地文件直接上传失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  async deleteFile(fileOrUrl: string): Promise<boolean> {
    try {
      const relativePath = this.extractKeyFromUrl(fileOrUrl);
      const fullPath = join(this.baseDir, relativePath);

      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      console.error("本地文件删除失败:", error);
      return false;
    }
  }

  async fileExists(fileOrUrl: string): Promise<boolean> {
    try {
      const relativePath = this.extractKeyFromUrl(fileOrUrl);
      const fullPath = join(this.baseDir, relativePath);

      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileInfo(fileOrUrl: string): Promise<{
    url: string;
    fileName: string;
    size: number;
    contentType?: string;
    updatedAt?: Date;
  }> {
    try {
      const relativePath = this.extractKeyFromUrl(fileOrUrl);
      const fullPath = join(this.baseDir, relativePath);

      const stats = await fs.stat(fullPath);
      const fileName = basename(relativePath);

      return {
        url: `${this.baseUrl}/${relativePath}`,
        fileName,
        size: stats.size,
        updatedAt: stats.mtime,
      };
    } catch (error) {
      throw new Error(
        `获取文件信息失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error("创建目录失败:", error);
    }
  }

  private getContentTypeFromFileName(fileName: string): string {
    const extension = extname(fileName).substring(1).toLowerCase();
    return IMAGE_MIME_TYPE_MAP[extension] || "application/octet-stream";
  }

  /**
   * 重写父类方法，从本地文件 URL 中提取相对路径
   */
  protected extractKeyFromUrl(url: string): string {
    // 如果传入的本身就是相对路径，直接返回
    if (!(url.startsWith("http://") || url.startsWith("https://"))) {
      // 移除基础 URL 前缀
      if (url.startsWith(`${this.baseUrl}/`)) {
        return url.substring(this.baseUrl.length + 1);
      }
      return url;
    }

    try {
      const urlObj = new URL(url);
      let pathname = urlObj.pathname;

      // 移除开头的斜杠
      if (pathname.startsWith("/")) {
        pathname = pathname.substring(1);
      }

      // 移除基础 URL 前缀
      if (pathname.startsWith(`${this.baseUrl}/`)) {
        return pathname.substring(this.baseUrl.length + 1);
      }

      return pathname;
    } catch {
      return url;
    }
  }

  /**
   * 生成更安全的唯一文件名（包含哈希值）
   */
  protected generateUniqueFileName(
    originalName: string,
    folder?: string
  ): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = extname(originalName);
    const nameWithoutExt = basename(originalName, extension)
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_")
      .substring(0, 30);

    // 生成文件内容的哈希值（可选，用于去重）
    const hash = createHash("md5")
      .update(originalName + timestamp)
      .digest("hex")
      .substring(0, 8);

    const uniqueName = `${nameWithoutExt}_${timestamp}_${randomStr}_${hash}${extension}`;
    return folder ? `${folder}/${uniqueName}` : uniqueName;
  }

  getProviderInfo(): {
    name: string;
    type: string;
    endpoint?: string;
  } {
    return {
      name: "Local File System",
      type: "local-storage",
      endpoint: this.baseDir,
    };
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    directorySize: Record<string, number>;
  }> {
    try {
      const stats = await this.calculateDirectoryStats(this.baseDir);
      return stats;
    } catch (error) {
      throw new Error(
        `获取存储统计失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  private async calculateDirectoryStats(dirPath: string): Promise<{
    totalFiles: number;
    totalSize: number;
    directorySize: Record<string, number>;
  }> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    let totalFiles = 0;
    let totalSize = 0;
    const directorySize: Record<string, number> = {};

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subStats = await this.calculateDirectoryStats(fullPath);
        totalFiles += subStats.totalFiles;
        totalSize += subStats.totalSize;
        directorySize[entry.name] = subStats.totalSize;
      } else if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        totalFiles += 1;
        totalSize += stats.size;
      }
    }

    return { totalFiles, totalSize, directorySize };
  }
}
