/**
 * 存储模块统一导出
 */

export { AbstractStorage } from "./AbstractStorage";
export { LocalStorage } from "./LocalStorage";
export { type OSSConfig, OSSStorage } from "./OSSStorage";
export {
  type StorageConfig,
  StorageFactory,
  type StorageType,
} from "./StorageFactory";
