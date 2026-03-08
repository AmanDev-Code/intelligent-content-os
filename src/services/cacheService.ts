import { API_CONFIG } from "@/lib/constants";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds, default 3600 (1 hour)
}

export class CacheService {
  private static instance: CacheService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

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
      const response = await fetch(`${this.baseUrl}/cache/get/${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(`Cache miss for key: ${key}`);
        return null;
      }

      const result = await response.json();
      if (result.data) {
        console.log(`Cache hit for key: ${key}`);
        return result.data;
      }

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

      const response = await fetch(`${this.baseUrl}/cache/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          data,
          ttl,
        }),
      });

      if (response.ok) {
        console.log(`Cache set successful for key: ${key}`);
        return true;
      }

      console.error(`Cache set failed for key: ${key}`);
      return false;
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
      const response = await fetch(`${this.baseUrl}/cache/delete/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log(`Cache delete successful for key: ${key}`);
        return true;
      }

      return false;
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
      const response = await fetch(`${this.baseUrl}/cache/invalidate/user/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log(`User cache invalidated for: ${userId}`);
        return true;
      }

      return false;
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