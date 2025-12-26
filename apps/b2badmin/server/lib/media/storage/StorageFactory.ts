/**
 * 存储工厂类
 * 根据配置创建和返回相应的存储策略实例
 * 支持单例模式，避免重复创建相同类型的存储实例
 */

import type { AbstractImageStorage } from "./ImageStorage";
import { LocalImageStorage } from "./impl/LocalImageStorage";
import { type OSSConfig, OSSImageStorage } from "./impl/OSSImageStorage";

export type StorageType = "oss" | "local";

type StorageConfig = {
  type: StorageType;
  config?: Record<string, any>;
};

class StorageFactory {
  private static instances: Map<StorageType, AbstractImageStorage> = new Map();

  /**
   * 创建或获取存储实例
   * @param type 存储类型
   * @param config 存储配置（可选，首次创建时必需）
   * @returns 存储实例
   */
  static createStorage(
    type: StorageType,
    config?: Record<string, any>
  ): AbstractImageStorage {
    // 如果已有实例且没有提供新配置，直接返回现有实例
    if (StorageFactory.instances.has(type) && !config) {
      const instance = StorageFactory.instances.get(type);
      if (instance) {
        return instance;
      }
    }

    let storage: AbstractImageStorage;
    let finalConfig = config;

    switch (type) {
      case "oss": {
        if (!finalConfig) {
          // 尝试从环境变量读取 OSS 配置
          finalConfig = StorageFactory.getOSSConfigFromEnv();
        }
        storage = new OSSImageStorage(finalConfig as OSSConfig);
        break;
      }

      case "local": {
        storage = new LocalImageStorage(finalConfig);
        break;
      }

      default:
        throw new Error(`不支持的存储类型: ${type}`);
    }

    // 缓存实例
    StorageFactory.instances.set(type, storage);
    return storage;
  }

  /**
   * 根据环境变量自动检测并创建存储实例
   * @returns 存储实例
   */
  static createStorageFromEnv(): AbstractImageStorage {
    const storageType = StorageFactory.detectStorageType();
    return StorageFactory.createStorage(storageType);
  }

  /**
   * 清除指定类型的存储实例缓存
   * @param type 存储类型
   */
  static clearInstance(type: StorageType): void {
    StorageFactory.instances.delete(type);
  }

  /**
   * 清除所有存储实例缓存
   */
  static clearAllInstances(): void {
    StorageFactory.instances.clear();
  }

  /**
   * 获取当前已创建的存储实例类型
   */
  static getActiveStorageTypes(): StorageType[] {
    return Array.from(StorageFactory.instances.keys());
  }

  /**
   * 检测应该使用哪种存储类型
   * @returns 存储类型
   */
  private static detectStorageType(): StorageType {
    // 优先级：环境变量 > 默认值
    // const envStorageType = env.STORAGE_TYPE?.toLowerCase();

    // if (envStorageType === "local") {
    //   return "local";
    // }

    // if (envStorageType === "oss") {
    //   return "oss";
    // }

    // 自动检测：优先使用 OSS，然后是本地存储
    if (StorageFactory.hasOSSConfig()) {
      return "oss";
    }

    // 默认使用本地存储
    return "local";
  }

  /**
   * 检查是否配置了 OSS
   */
  private static hasOSSConfig(): boolean {
    const requiredEnvVars = [
      "ACCESS_KEY_ID",
      "SECRET_ACCESS_KEY",
      "BUCKET",
      "ENDPOINT",
    ] as const;

    return requiredEnvVars.every((varName) => !!process.env[varName]);
  }

  /**
   * 从环境变量获取 OSS 配置
   */
  private static getOSSConfigFromEnv() {
    const accessKeyId = process.env.ACCESS_KEY_ID;
    const secretAccessKey = process.env.SECRET_ACCESS_KEY;
    const bucket = process.env.BUCKET;
    const region = process.env.REGION || "default";
    const endpoint = process.env.ENDPOINT;
    const domain = process.env.DOMAIN;

    if (!(accessKeyId && secretAccessKey && bucket && endpoint)) {
      throw new Error(
        "OSS 配置缺失：请检查环境变量 ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET, ENDPOINT"
      );
    }

    return {
      accessKeyId,
      secretAccessKey,
      bucket,
      region,
      endpoint,
      domain,
    };
  }

  /**
   * 创建存储配置对象
   * @param type 存储类型
   * @param customConfig 自定义配置
   * @returns 完整的存储配置
   */
  static createStorageConfig(
    type: StorageType,
    customConfig: Record<string, any> = {}
  ): StorageConfig {
    const baseConfig: StorageConfig = { type };

    switch (type) {
      case "oss":
        baseConfig.config = {
          ...StorageFactory.getOSSConfigFromEnv(),
          ...customConfig,
        };
        break;

      // case "local":
      //   baseConfig.config = {
      //     baseDir:
      //       customConfig.baseDir || env.LOCAL_STORAGE_DIR || "public/uploads",
      //     baseUrl: customConfig.baseUrl || env.LOCAL_STORAGE_URL || "/uploads",
      //     maxFileSize:
      //       customConfig.maxFileSize ||
      //       Number.parseInt(env.MAX_FILE_SIZE || "10485760", 10), // 10MB
      //   };
      //   break;

      default:
        throw new Error(`不支持的存储类型: ${type}`);
    }

    return baseConfig;
  }

  /**
   * 获取存储提供者信息
   * @param type 存储类型
   */
  static getProviderInfo(type: StorageType) {
    const storage = StorageFactory.createStorage(type);
    return storage.getProviderInfo();
  }

  /**
   * 测试存储连接
   * @param type 存储类型
   * @param config 存储配置
   */
  static async testConnection(
    type: StorageType,
    config?: Record<string, any>
  ): Promise<{
    success: boolean;
    provider: string;
    message: string;
  }> {
    try {
      const storage = StorageFactory.createStorage(type, config);
      const providerInfo = storage.getProviderInfo();

      // 尝试上传一个测试文件来验证连接
      const testContent = "test connection";
      const testFileName = `test_${Date.now()}.txt`;

      const result = await storage.uploadFile(
        testContent,
        testFileName,
        "tests",
        "text/plain"
      );

      // 上传成功后立即删除测试文件
      await storage.deleteFile(result.url || result.key || "");

      return {
        success: true,
        provider: providerInfo.name,
        message: "连接成功，测试文件已上传并删除",
      };
    } catch (error) {
      return {
        success: false,
        provider: type,
        message: `连接失败: ${error instanceof Error ? error.message : "未知错误"}`,
      };
    }
  }
}

export { StorageFactory };
export type { StorageConfig };
