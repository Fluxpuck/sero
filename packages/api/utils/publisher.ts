import Redis from "ioredis";

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
type Payload = {
  code: number;
  message?: string;
  data?: any[];
  timestamp: Date;
};

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const publisher = new Redis(redisUrl);

/**
 * Publisher class for sending messages to a Redis channel
 */
export function publish(channel: RedisChannel, data: any): Promise<number> {
  if (!Object.values(RedisChannel).includes(channel)) {
    // Send Message to Error Channel if channel does not exist
    const payload: Payload = {
      code: 404,
      message: "This channel does not exist",
      timestamp: new Date(),
    };
    return publisher.publish(RedisChannel.ERROR, JSON.stringify(payload));
  }

  // Publish Message to Channel
  const payload: Payload = {
    code: 200,
    message: "Successfully published to channel",
    data,
    timestamp: new Date(),
  };
  return publisher.publish(channel, JSON.stringify(payload));
}

/**
 * Test the connection to Redis
 */
export async function testConnection(): Promise<boolean> {
  try {
    await publisher.ping();
    return true;
  } catch (err) {
    console.error("Error connecting to Redis:", err);
    return false;
  }
}
