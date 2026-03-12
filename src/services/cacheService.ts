import { api } from "@/lib/apiClient";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds, default 3600 (1 hour)
}

export class CacheService {
  private static instance: CacheService;
  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Get data from Dragonfly cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const result = await api.cache.get(encodeURIComponent(key));
      if (result?.data) {
        console.log(`Cache hit for key: ${key}`);
        return result.data as T;
      }
      console.log(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in Dragonfly cache
   */
  async set<T = any>(key: string, data: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const { ttl = 3600 } = options;
      await api.cache.set(key, data, ttl);
      console.log(`Cache set successful for key: ${key}`);
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete specific key from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await api.cache.delete(encodeURIComponent(key));
      console.log(`Cache delete successful for key: ${key}`);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Invalidate all cache for a user
   */
  async invalidateUser(userId: string): Promise<boolean> {
    try {
      await api.cache.invalidateUser(encodeURIComponent(userId));
      console.log(`User cache invalidated for: ${userId}`);
      return true;
    } catch (error) {
      console.error(`Cache invalidate error for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Cache-first data fetching pattern
   * Tries cache first, falls back to database query, then caches the result
   */
  async getOrSet<T = any>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cachedData = await this.get<T>(key);
    if (cachedData !== null) {
      return cachedData;
    }

    // Cache miss - fetch from database
    console.log(`Cache miss for ${key}, fetching from database`);
    try {
      const freshData = await fetchFunction();
      
      // Cache the result for next time (only if data exists)
      if (freshData && (Array.isArray(freshData) ? freshData.length > 0 : true)) {
        await this.set(key, freshData, options);
      }
      
      return freshData;
    } catch (error) {
      console.error(`Database fetch error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Generate cache key for user-specific data
   */
  static userKey(userId: string, resource: string, ...params: string[]): string {
    const parts = [resource, userId, ...params].filter(Boolean);
    return parts.join(':');
  }

  /**
   * Generate cache key for job-specific data
   */
  static jobKey(jobId: string, userId: string, resource: string): string {
    return `${resource}:job:${jobId}:user:${userId}`;
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();

// Export utility functions
export const { userKey, jobKey } = CacheService;