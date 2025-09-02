import { Client } from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";

const event: Event = {
  name: RedisChannel.GUILD_MEMBER_BIRTHDAY,
  once: false,
  async execute(message: string, client: Client): Promise<any> {
    // Skip empty messages
    if (!message) return;

    try {
      const birthdayData = JSON.parse(message);
      logger.debug(`Birthday event received: ${JSON.stringify(birthdayData)}`);

      // Handle birthday event
      // TODO: Implement birthday handling logic
    } catch (error) {
      logger.error(`Error processing birthday message: ${error}`);
    }
  },
};

export default event;
