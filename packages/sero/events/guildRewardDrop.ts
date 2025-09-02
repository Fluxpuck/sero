import { Client } from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";

const event: Event = {
  name: RedisChannel.GUILD_DROP_REWARD,
  once: false,
  async execute(message: string, client: Client): Promise<any> {
    // Skip empty messages
    if (!message) return;

    try {
      const dropData = JSON.parse(message);
      logger.debug(`Drop event received: ${JSON.stringify(dropData)}`);

      // Handle drop event
      // TODO: Implement drop handling logic
    } catch (error) {
      logger.error(`Error processing drop message: ${error}`);
    }
  },
};

export default event;
