import { Events, Client } from "discord.js";
import { Event } from "../types/client.types";
import { logger } from "../utils/logger";
import { subscribe } from "../redis/subscribe";

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

    // Subscribe to Redis channels
    subscribe(client);
  },
};

export default event;
