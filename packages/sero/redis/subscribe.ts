import Redis from "ioredis";

export enum RedisChannels {
  LEVEL = "guildMemberLevel",
  ROLE = "guildMemberRole",
  REWARD_DROP = "guildRewardDrops",
  BIRTHDAY = "guildMemberBirthday",
}

export const redis = new Redis({
  host: process.env.NODE_ENV === "production" ? "redis" : "localhost",
  reconnectOnError: () => true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 1000, 5000);
    console.log(
      `[Redis] Retrying connection in ${delay / 1000}s (attempt ${times})`
    );
    return delay;
  },
});

// Log connection events
redis.on("connect", () => console.log("[Redis] Connected"));
redis.on("error", (err) => console.error("[Redis] Error:", err));

/**
 * Subscribe to Redis channels and handle messages
 */
export type MessageHandler = (channel: string, message: string) => void;
export function subscribe(channels: RedisChannels[], handler: MessageHandler) {
  // Subscribe to channels
  channels.forEach((channel) => {
    redis.subscribe(channel, (err) => {
      if (err) console.error(`[Redis] Failed to subscribe to ${channel}:`, err);
      else if (process.env.NODE_ENV === "development") {
        console.log(`[Redis] Subscribed to ${channel}`);
      }
    });
  });

  // Listen for messages
  redis.on("message", (channel, message) => {
    try {
      handler(channel, message);
    } catch (error) {
      console.error(`[Redis] Error handling message from ${channel}:`, error);
    }
  });

  return () => channels.forEach((channel) => redis.unsubscribe(channel));
}

/**
 * Test the Redis connection
 * @returns Promise that resolves if connection is successful, rejects otherwise
 */
export function testRedisConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    const pingTimeout = setTimeout(() => {
      reject(new Error("Redis connection test timed out"));
    }, 5000);

    redis
      .ping()
      .then(() => {
        clearTimeout(pingTimeout);
        resolve();
      })
      .catch((error) => {
        clearTimeout(pingTimeout);
        reject(error);
      });
  });
}
