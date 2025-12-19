/**
 * 抽象存储基类
 * 定义了所有存储策略必须实现的通用接口
 * 采用抽象类而非接口，可以提供部分通用实现
 */

export abstract class AbstractStorage {
  /**
   * 存储配置信息
   */
  protected config: Record<string, any>;

  constructor(config: Record<string, any> = {}) {
    this.config = config;
  }

  /**
   * 上传单个文件
   * @param file 文件数据（Buffer、Uint8Array、Blob或string）
   * @param originalName 原始文件名
   * @param folder 存储文件夹
   * @param contentType MIME类型
   * @returns 上传结果，包含URL和文件信息
   */
  abstract uploadFile(
    file: Buffer | Uint8Array | string | Blob,
    originalName: string,
    folder: string,
    contentType?: string
  ): Promise<{
    url: string;
    fileName: string;
    size: number;
    contentType: string;
    key?: string; // 存储后端内部标识
  }>;

  /**
   * 直接上传文件到指定key
   * @param file 文件数据
   * @param key 存储键
   * @param contentType MIME类型
   */
  abstract uploadFileDirect(
    file: Buffer | Uint8Array | string | Blob,
    key: string,
    contentType?: string
  ): Promise<{
    key: string;
    url: string;
    [key: string]: any;
  }>;

  /**
   * 批量上传文件
   * @param files 文件数组
   * @param folder 存储文件夹
   * @returns 批量上传结果
   */
  async uploadFiles(
    files: Array<{
      file: Buffer | Uint8Array | string | Blob;
      originalName: string;
      contentType?: string;
    }>,
    folder: string
  ): Promise<{
    success: Array<{
      url: string;
      fileName: string;
      size: number;
      contentType: string;
      key?: string;
    }>;
    failed: Array<{
      fileName: string;
      error: string;
    }>;
  }> {
    const results = await Promise.allSettled(
      files.map(async ({ file, originalName, contentType }) =>
        this.uploadFile(file, originalName, folder, contentType)
      )
    );

    const success: any[] = [];
    const failed: any[] = [];

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
  }

  /**
   * 删除文件
   * @param fileOrUrl 文件URL或存储后端标识
   */
  abstract deleteFile(fileOrUrl: string): Promise<boolean>;

  /**
   * 批量删除文件
   * @param filesOrUrls 文件URL或标识数组
   */
  async deleteFiles(filesOrUrls: string[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const results = await Promise.allSettled(
      filesOrUrls.map(async (fileOrUrl) => this.deleteFile(fileOrUrl))
    );

    let success = 0;
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        success += 1;
      } else {
        errors.push(`${filesOrUrls[index]}: ${"删除失败"}`);
      }
    });

    return {
      success,
      failed: errors.length,
      errors,
    };
  }

  /**
   * 检查文件是否存在
   * @param fileOrUrl 文件URL或存储后端标识
   */
  abstract fileExists(fileOrUrl: string): Promise<boolean>;

  /**
   * 获取文件信息
   * @param fileOrUrl 文件URL或存储后端标识
   */
  abstract getFileInfo(fileOrUrl: string): Promise<{
    url: string;
    fileName: string;
    size: number;
    contentType?: string;
    updatedAt?: Date;
  }>;

  /**
   * 生成唯一文件名
   * 统一的文件命名策略
   */
  protected generateUniqueFileName(
    originalName: string,
    folder?: string
  ): string {
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
    const shortName = (originalName.split(".")[0] || "file").substring(0, 20);
    return `${folder || "uploads"}/${shortName}_${randomStr}.${extension}`;
  }

  /**
   * 从URL中提取文件标识
   * 子类需要根据自己的URL格式重写此方法
   */
  protected extractKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith("/")
        ? urlObj.pathname.substring(1)
        : urlObj.pathname;
    } catch {
      return url;
    }
  }

  /**
   * 验证文件类型
   * 通用的文件类型验证逻辑
   */
  protected validateFileType(
    fileName: string,
    allowedTypes?: string[]
  ): boolean {
    if (!allowedTypes) {
      return true;
    }

    const extension = fileName.split(".").pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  /**
   * 验证文件大小
   * 通用的大小验证逻辑
   */
  protected validateFileSize(
    size: number,
    maxSize: number = 10 * 1024 * 1024
  ): boolean {
    return size <= maxSize;
  }

  /**
   * 获取存储提供者信息
   */
  abstract getProviderInfo(): {
    name: string;
    type: string;
    endpoint?: string;
  };

  /**
   * 处理文件数据为统一格式
   */
  protected async processFileData(
    file: Buffer | Uint8Array | string | Blob
  ): Promise<{ body: Buffer | Uint8Array; size: number }> {
    if (file instanceof Blob) {
      const arrayBuffer = await file.arrayBuffer();
      return {
        body: new Uint8Array(arrayBuffer),
        size: arrayBuffer.byteLength,
      };
    }
    if (typeof file === "string") {
      const body = Buffer.from(file);
      return { body, size: body.length };
    }
    return { body: file, size: file.length };
  }
}
