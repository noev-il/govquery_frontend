// GovQuery Cache Manager
// Implements caching for API responses to improve performance

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class GovQueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Generate cache keys
  static getHealthKey(): string {
    return 'health_check';
  }

  static getSchemasKey(): string {
    return 'schemas_list';
  }

  static getSchemaKey(tableCode: string): string {
    return `schema_${tableCode}`;
  }

  static getQueryKey(query: string, tableCodes?: string[], modelChoice?: string): string {
    const params = JSON.stringify({ query, tableCodes, modelChoice });
    return `query_${btoa(params).slice(0, 32)}`;
  }
}

export const govQueryCache = new GovQueryCache();
export { GovQueryCache };
