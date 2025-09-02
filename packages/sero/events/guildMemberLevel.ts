import { Client } from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";

const event: Event = {
  name: RedisChannel.GUILD_MEMBER_LEVEL,
  once: false,
  async execute(message: string, client: Client): Promise<any> {
    // Skip empty messages
    if (!message) return;

    try {
      const levelData = JSON.parse(message);
      logger.debug(`Level event received: ${JSON.stringify(levelData)}`);

      // Handle level event
      // TODO: Implement level handling logic
    } catch (error) {
      logger.error(`Error processing level message: ${error}`);
    }
  },
};

export default event;
