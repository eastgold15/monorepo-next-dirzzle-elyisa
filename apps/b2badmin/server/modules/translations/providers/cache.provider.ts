import type { CacheService } from "../interfaces/cache.interface";
// LRU缓存实现
export class LRUCache<V> implements CacheService<V> {
  private readonly cache: Map<string, { value: V; timestamp: number }>;
  private readonly maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }
  has(key: string): boolean {
    return this.cache.has(key);
  }

  get(key: string): V | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    // 检查是否过期（1小时）
    if (Date.now() - item.timestamp >= 3_600_000) {
      this.cache.delete(key);
      return null;
    }

    // 更新为“最近使用”：删除并重新插入
    const value = item.value;
    this.cache.delete(key);
    this.cache.set(key, { value, timestamp: item.timestamp });
    return value;
  }

  set(key: string, value: V): void {
    const isNew = !this.cache.has(key);

    // 如果是新项且容量已满，淘汰最旧项
    if (isNew && this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    // 插入或更新
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  delete(key: string): boolean {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
