import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import NodeCache from "node-cache";
import { Command, Event } from "./types/client.types";

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

// Load events
const loadEvents = (): void => {
  const eventsPath: string = path.join(__dirname, "events");
  const eventFiles: string[] = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of eventFiles) {
    const filePath: string = path.join(eventsPath, file);
    const event: Event = require(filePath);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`Loaded event: ${event.name}`);
    }
  }
};

// Load commands
const loadCommands = (): void => {
  const commandsPath: string = path.join(__dirname, "commands");
  const commandFiles: string[] = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    const filePath: string = path.join(commandsPath, file);
    const command: Command = require(filePath).default;

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);

      if (process.env.NODE_ENV !== "production") {
        console.log(`Loaded command: ${command.data.name}`);
      }
    }
  }
};

// Initialize bot
const initBot = async (): Promise<void> => {
  try {
    // Load events and commands
    loadEvents();
    loadCommands();

    // Check for Discord token
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error("DISCORD_TOKEN is missing in the environment variables");
    }

    // Login to Discord with token from .env
    await client.login(token);
    console.log(`Logged in as ${client.user?.tag || "unknown"}`);
  } catch (error) {
    console.error("Error initializing bot:", error);
    process.exit(1);
  }
};

// Start the bot
initBot();
