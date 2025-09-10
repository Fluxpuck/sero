import Redis from "ioredis";
import { Client } from "discord.js";
import { logger } from "../utils/logger";

const log = logger("redis-subscribe");

/**
 * Redis Channels
 * These correspond to Discord events
 */
export enum RedisChannel {
  GUILD_MEMBER_LEVEL = "guildMemberLevel",
  GUILD_MEMBER_TEMPORARY_ROLE = "guildMemberTemporaryRole",
  GUILD_MEMBER_BIRTHDAY = "guildMemberBirthday",
  GUILD_DROP_REWARD = "guildRewardDrops",
  GUILD_REVOKE_TEMPORARY_BAN = "guildRevokeTemporaryBan",

  ERROR = "error",
}

/**
 * Redis client
 */
export const redis = new Redis({
  host: process.env.NODE_ENV === "production" ? "redis" : "localhost",
  reconnectOnError: () => true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 1000, 5000);
    log.warn(`Retrying connection in ${delay / 1000}s (attempt ${times})`);
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
  const channels = Object.values(RedisChannel);

  // Track subscription status
  const subscriptionStatus = new Map<string, boolean>();

  // Subscribe to all channels
  const subscribePromises = channels.map((channel) => {
    return new Promise<void>((resolve) => {
      redis.subscribe(channel, (err) => {
        if (err) {
          log.error(`Failed to subscribe to ${channel}:`, err);
          subscriptionStatus.set(channel, false);
        } else {
          subscriptionStatus.set(channel, true);
          log.debug(`Subscribed to ${channel}`);
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
    log.info(
      `Successfully subscribed to ${successCount}/${channels.length} channels`
    );
  });

  // Listen for messages
  redis.on("message", (channel, message) => {
    try {
      // Parse the message
      const payload = JSON.parse(message) as RedisPayload;

      // Emit the Discord Client Event
      client.emit(channel, payload.data, client);

      log.debug(`Received event ${channel}`, payload);
    } catch (error) {
      log.error(`Failed to process message from ${channel}:`, error);
    }
  });

  // Return cleanup function
  return () => {
    channels.forEach((channel) => redis.unsubscribe(channel));
    log.info("Unsubscribed from all channels");
  };
}
