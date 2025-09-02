import { Client } from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";

const event: Event = {
  name: RedisChannel.GUILD_MEMBER_TEMPORARY_ROLE,
  once: false,
  async execute(message: string, client: Client): Promise<any> {
    // Skip empty messages
    if (!message) return;

    try {
      const temporaryRoleData = JSON.parse(message);
      logger.debug(
        `Temporary role event received: ${JSON.stringify(temporaryRoleData)}`
      );

      // Handle temporary role event
      // TODO: Implement temporary role handling logic
    } catch (error) {
      logger.error(`Error processing temporary role message: ${error}`);
    }
  },
};

export default event;
