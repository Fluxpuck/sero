import Redis from "ioredis";
import { logger } from "../utils/logger";

const log = logger("redis-cache");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const cacheClient = new Redis(redisUrl);

/**
 * Redis Cache Client
 * Provides methods for interacting with Redis for caching purposes
 */
export class RedisCache {
  /**
   * Get a value from the cache
   * @param key - The cache key
   * @returns The cached value or null if not found
   */
  static async get(key: string): Promise<any> {
    try {
      const data = await cacheClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      log.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in the cache
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Time to live in seconds (optional)
   * @returns True if successful, false otherwise
   */
  static async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);

      if (ttl) {
        await cacheClient.setex(key, ttl, serialized);
      } else {
        await cacheClient.set(key, serialized);
      }

      return true;
    } catch (error) {
      log.error(`Error setting cache for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a value from the cache
   * @param key - The cache key
   * @returns True if successful, false otherwise
   */
  static async del(key: string): Promise<boolean> {
    try {
      await cacheClient.del(key);
      return true;
    } catch (error) {
      log.error(`Error deleting cache for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache entries with a specific prefix
   * @param prefix - The key prefix to match
   * @returns Number of keys deleted
   */
  static async clearByPrefix(prefix: string): Promise<number> {
    try {
      const keys = await cacheClient.keys(`${prefix}*`);
      if (keys.length > 0) {
        return await cacheClient.del(...keys);
      }
      return 0;
    } catch (error) {
      log.error(`Error clearing cache with prefix ${prefix}:`, error);
      return 0;
    }
  }

  /**
   * Test the connection to Redis
   * @returns True if connected, false otherwise
   */
  static async testConnection(): Promise<boolean> {
    try {
      await cacheClient.ping();
      return true;
    } catch (error) {
      log.error("Error connecting to Redis cache:", error);
      return false;
    }
  }
}
