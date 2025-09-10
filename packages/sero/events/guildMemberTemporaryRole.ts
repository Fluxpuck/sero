import { Client } from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";

const event: Event = {
  name: RedisChannel.GUILD_MEMBER_TEMPORARY_ROLE,
  once: false,
  async execute(message: string, client: Client): Promise<any> {
    if (!message || !client) return; // Skip empty messages
    logger.debug("Processing temporary role message", message);

    try {
      // Handle temporary role event
      // TODO: Implement temporary role handling logic
    } catch (error) {
      logger.error(`Error processing temporary role message`, error);
    }
  },
};

export default event;
