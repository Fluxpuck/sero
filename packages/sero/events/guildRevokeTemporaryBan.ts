import { Client } from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";

const event: Event = {
  name: RedisChannel.GUILD_REVOKE_TEMPORARY_BAN,
  once: false,
  async execute(message: string, client: Client): Promise<any> {
    logger.debug(`Revoke temporary ban event received: ${message}`);

    // Skip empty messages
    if (!message) return;

    try {
      const revokeData = JSON.parse(message);
      logger.debug(
        `Revoke temporary ban event received: ${JSON.stringify(revokeData)}`
      );

      // Handle revoke temporary ban event
      // TODO: Implement revoke temporary ban handling logic
    } catch (error) {
      logger.error(`Error processing revoke temporary ban message: ${error}`);
    }
  },
};

export default event;
