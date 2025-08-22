import Redis from "ioredis";
import { Client } from "discord.js";

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

/**
 * Subscribe to Redis channels and handle messages
 */
export type payload = { code: string; data: any };
export function subscribe(client: Client) {
  // Subscribe to channels
  const channels = Object.values(RedisChannels);
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
    // Emit the Discord Client Event
    const payload: payload = JSON.parse(message);
    client.emit(payload.code, payload.data);

    if (process.env.NODE_ENV === "development") {
      console.log(`[Redis] Received event ${channel}`, payload);
    }
  });

  return () => channels.forEach((channel) => redis.unsubscribe(channel));
}
