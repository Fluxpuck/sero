import { Events, Client } from "discord.js";
import { Event } from "../types/client.types";
import { logger } from "../utils/logger";
import { subscribe } from "../redis/subscribe";
import { healthCheck } from "../database/connection";
import { ResponseStatus } from "../types/response.types";

const event: Event = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    logger.success(`Logged in as ${client.user?.tag}`);
    logger.info(`Serving in ${client.guilds.cache.size} guilds`);
    logger.info(`Started at ${new Date().toLocaleString()}`);

    client.user?.setPresence({
      activities: [{ name: "🤖", type: 4 }],
      status: "online",
    });

    // Check health of database, and Redis connections
    const result = await healthCheck();
    if (result.status === ResponseStatus.SUCCESS) {
      const { postgres, redis } = result.services;

      if (postgres === ResponseStatus.SUCCESS) {
        logger.success(`Postgress connected successfully`);
      } else {
        logger.error(`Postgress connection failed`);
      }

      if (redis === ResponseStatus.SUCCESS) {
        logger.success(`Redis connected successfully`);
      } else {
        logger.error(`Redis connection failed`);
      }
    }

    // Subscribe to Redis channels
    subscribe(client);
  },
};

export default event;
