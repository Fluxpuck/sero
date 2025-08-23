import Redis from "ioredis";
import { logger } from "../utils/logger";

/**
 * Redis Channels
 * These correspond to Discord events
 */
export enum RedisChannel {
  GUILD_MEMBER_LEVEL = "guildMemberLevel",
  GUILD_MEMBER_ROLE = "guildMemberRole",
  GUILD_MEMBER_BIRTHDAY = "guildMemberBirthday",
  GUILD_DROP_REWARD = "guildRewardDrops",

  ERROR = "error",
}

/**
 * Standard redis publisher payload
 */
type Payload<T = any> = {
  code: number;
  message?: string;
  data?: T;
  timestamp: Date;
};

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const publisher = new Redis(redisUrl);

/**
 * Publishes a message to a Redis channel
 * @param channel - The Redis channel to publish to
 * @param data - The data to publish (will be serialized as JSON)
 * @returns Promise resolving to the number of clients that received the message, or void if channel is invalid
 * @throws Will throw an error if Redis connection fails
 */
export async function publish<T = any>(
  channel: RedisChannel,
  data: T
): Promise<number | void> {
  try {
    if (Object.values(RedisChannel).includes(channel)) {
      const payload: Payload<T> = {
        code: 200,
        message: "Successfully published to channel",
        data,
        timestamp: new Date(),
      };
      return await publisher.publish(channel, JSON.stringify(payload));
    }

    logger.warn(`Invalid Redis channel: ${channel}`);
    return Promise.resolve();
  } catch (error) {
    logger.error(`Error publishing to Redis channel ${channel}:`, error);
    throw error; // Re-throw to allow caller to handle
  }
}

/**
 * Test the connection to Redis
 */
export async function testConnection(): Promise<boolean> {
  try {
    await publisher.ping();
    return true;
  } catch (err) {
    logger.error("Error connecting to Redis:", err);
    return false;
  }
}
