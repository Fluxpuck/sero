import dotenv from "dotenv";
import path from "path";
import NodeCache from "node-cache";

import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Command } from "./types/client.types";
import { loadEvents, loadCommands } from "./utils/loaders";

import { logger } from "./utils/logger";

dotenv.config({ path: path.join(__dirname, ".", "config", ".env") });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
    cooldowns: NodeCache;
  }
}

client.commands = new Collection<string, Command>();
client.cooldowns = new NodeCache();

// Initialize bot
const initBot = async (): Promise<void> => {
  try {
    // Check for Discord token
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error("DISCORD_TOKEN is missing in the environment variables");
    }

    logger.info("Initializing Bot...");

    // Load commands
    loadCommands(client);

    // Load events
    loadEvents(client);

    // Login to Discord
    await client.login(token);
  } catch (error) {
    logger.error("Error initializing bot:", error);
    process.exit(1);
  }
};

// Start the bot
initBot();
