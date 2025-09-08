import { Client } from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";

const event: Event = {
  name: RedisChannel.GUILD_MEMBER_LEVEL,
  once: false,
  async execute(message: any[], client: Client): Promise<any> {
    if (!message || !client) return; // Skip empty messages
    logger.debug(`Processing level message`, message);

    try {
      // Handle level event
      // TODO: Implement level handling logic
    } catch (error) {
      logger.error(`Error processing level message: ${error}`);
    }
  },
};

export default event;
