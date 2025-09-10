import { Events, Client } from "discord.js";
import { Event } from "../types/client.types";
import { logger } from "../utils/logger";
import { subscribe } from "../redis/subscribe";
import { healthCheck } from "../database/connection";
import { ResponseStatus } from "../types/response.types";

const log = logger("ready");

const event: Event = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    log.success(`Logged in as ${client.user?.tag}`);
    log.info(`Serving in ${client.guilds.cache.size} guilds`);
    log.info(`Started at ${new Date().toLocaleString()}`);

    client.user?.setPresence({
      activities: [{ name: "🤖", type: 4 }],
      status: "online",
    });

    // Check health of database, and Redis connections
    const result = await healthCheck();
    if (result.status === ResponseStatus.SUCCESS) {
      const { postgres, redis } = result.services;

      if (postgres === ResponseStatus.SUCCESS) {
        log.success(`Postgress connected successfully`);
      } else {
        log.error(`Postgress connection failed`);
      }

      if (redis === ResponseStatus.SUCCESS) {
        log.success(`Redis connected successfully`);
      } else {
        log.error(`Redis connection failed`);
      }
    }

    // Subscribe to Redis channels
    subscribe(client);
  },
};

export default event;
