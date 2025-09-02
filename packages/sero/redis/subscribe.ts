import Redis from "ioredis";
import { Client } from "discord.js";
import { logger } from "../utils/logger";

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
    logger.warn(
      `Redis: Retrying connection in ${delay / 1000}s (attempt ${times})`
    );
    return delay;
  },
});

/**
 * Redis message payload structure
 */
export interface RedisPayload<T = any> {
  code: number;
  message?: string;
  data?: T;
  timestamp: Date;
}

/**
 * Subscribe to Redis channels and handle messages
 * @param client - Discord.js Client to emit events to
 * @returns Cleanup function that unsubscribes from all channels
 */
export function subscribe(client: Client): () => void {
  // Subscribe to channels
  const channels = Object.values(RedisChannels);

  // Track subscription status
  const subscriptionStatus = new Map<string, boolean>();

  // Subscribe to all channels
  const subscribePromises = channels.map((channel) => {
    return new Promise<void>((resolve) => {
      redis.subscribe(channel, (err) => {
        if (err) {
          logger.error(`Redis: Failed to subscribe to ${channel}:`, err);
          subscriptionStatus.set(channel, false);
        } else {
          subscriptionStatus.set(channel, true);
          logger.debug(`Redis: Subscribed to ${channel}`);
        }
        resolve();
      });
    });
  });

  // Wait for all subscriptions to complete
  Promise.all(subscribePromises).then(() => {
    const successCount = Array.from(subscriptionStatus.values()).filter(
      Boolean
    ).length;
    logger.info(
      `Redis: Successfully subscribed to ${successCount}/${channels.length} channels`
    );
  });

  // Listen for messages
  redis.on("message", (channel, message) => {
    try {
      // Parse the message
      const payload = JSON.parse(message) as RedisPayload;

      // Emit the Discord Client Event
      client.emit(channel, payload.data);

      logger.debug(`Redis: Received event ${channel}`, payload);
    } catch (error) {
      logger.error(`Redis: Failed to process message from ${channel}:`, error);
    }
  });

  // Return cleanup function
  return () => {
    channels.forEach((channel) => redis.unsubscribe(channel));
    logger.info("Redis: Unsubscribed from all channels");
  };
}
