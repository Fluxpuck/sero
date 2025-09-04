import { Client } from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";

const event: Event = {
  name: RedisChannel.GUILD_MEMBER_LEVEL,
  once: false,
  async execute(message: any[], client: Client): Promise<any> {
    logger.debug(`Level event received: ${message}`);

    // Skip empty messages
    if (!message) return;

    try {
      logger.debug("Level event received", message);

      // Handle level event
      // TODO: Implement level handling logic
    } catch (error) {
      logger.error(`Error processing level message: ${error}`);
    }
  },
};

export default event;
