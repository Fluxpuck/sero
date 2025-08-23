import { Request, Response, NextFunction } from "express";
import { RedisCache } from "../redis/cache";
import { logger } from "../utils/logger";

/**
 * Cache options interface
 */
export interface CacheOptions {
  /** Time to live in seconds */
  ttl?: number;
  /** Custom key generator function */
  keyGenerator?: (req: Request) => string;
  /** Cache key prefix */
  prefix?: string;
  /** Whether to include query parameters in the cache key */
  includeQuery?: boolean;
  /** Whether to include request body in the cache key */
  includeBody?: boolean;
  /** Whether to include authenticated user in the cache key */
  includeAuth?: boolean;
  /** Condition function to determine if response should be cached */
  condition?: (req: Request) => boolean;
}

/**
 * Default cache options
 */
const defaultOptions: CacheOptions = {
  ttl: 300, // 5 minutes
  prefix: "api-cache:",
  includeQuery: true,
  includeBody: false,
  includeAuth: false,
};

/**
 * Generate a cache key based on the request
 */
function generateCacheKey(req: Request, options: CacheOptions): string {
  // Use custom key generator if provided
  if (options.keyGenerator) {
    return `${options.prefix || ""}${options.keyGenerator(req)}`;
  }

  // Default key generation
  let key = `${req.method}:${req.originalUrl.split("?")[0]}`;

  // Include query parameters if enabled
  if (options.includeQuery && Object.keys(req.query).length > 0) {
    const sortedQuery = Object.keys(req.query)
      .sort()
      .reduce((acc, key) => {
        acc[key] = req.query[key];
        return acc;
      }, {} as Record<string, any>);

    key += `:${JSON.stringify(sortedQuery)}`;
  }

  // Include request body if enabled
  if (options.includeBody && Object.keys(req.body).length > 0) {
    key += `:${JSON.stringify(req.body)}`;
  }

  // Include authenticated user if enabled
  if (options.includeAuth && req.headers.authorization) {
    key += `:${req.headers.authorization}`;
  }

  return `${options.prefix || ""}${key}`;
}

/**
 * Cache middleware factory
 * Creates a middleware that caches responses based on provided options
 *
 * @param options - Cache configuration options
 * @returns Express middleware function
 */
export function cache(options: CacheOptions = {}) {
  // Merge with default options
  const mergedOptions: CacheOptions = { ...defaultOptions, ...options };

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests by default, unless a condition is provided
    if (req.method !== "GET" && !mergedOptions.condition) {
      return next();
    }

    // Check condition if provided
    if (mergedOptions.condition && !mergedOptions.condition(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = generateCacheKey(req, mergedOptions);

    try {
      // Try to get from cache
      const cachedData = await RedisCache.get(cacheKey);

      if (cachedData) {
        // Return cached response
        logger.debug(`Cache hit for ${cacheKey}`);
        return res.status(cachedData.status).json(cachedData.body);
      }

      // Cache miss - capture the response
      logger.debug(`Cache miss for ${cacheKey}`);

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to intercept the response
      res.json = function (body: any) {
        // Restore original method
        res.json = originalJson;

        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Store in cache
          const dataToCache = {
            status: res.statusCode,
            body: body,
          };

          RedisCache.set(cacheKey, dataToCache, mergedOptions.ttl).catch(
            (err) => logger.error(`Error setting cache for ${cacheKey}:`, err)
          );
        }

        // Call original method
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error:`, error);
      next();
    }
  };
}

/**
 * Clear cache for a specific route or pattern
 *
 * @param prefix - Cache key prefix to clear
 * @returns Number of keys cleared
 */
export async function clearCache(prefix: string): Promise<number> {
  return await RedisCache.clearByPrefix(prefix);
}

/**
 * Cache invalidation middleware
 * Creates a middleware that invalidates cache based on provided prefix
 *
 * @param prefix - Cache key prefix to invalidate
 * @returns Express middleware function
 */
export function invalidateCache(prefix: string) {
  return async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      await clearCache(prefix);
      next();
    } catch (error) {
      logger.error(`Cache invalidation error:`, error);
      next();
    }
  };
}
