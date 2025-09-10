import fs from "fs";
import path from "path";
import { Client, ClientEvents } from "discord.js";
import { Command, Event } from "../types/client.types";
import { logger } from "./logger";
import { RedisChannel } from "../redis/subscribe";

/**
 * Load event handlers from the events directory
 * @param client Discord.js client instance
 * @returns void
 */
export const loadEvents = (client: Client): void => {
  const log = logger("event-loader");

  const eventsPath: string = path.join(__dirname, "..", "events");

  // Check if events directory exists
  if (!fs.existsSync(eventsPath)) {
    log.error(`Events directory not found at ${eventsPath}`);
    return;
  }

  const eventFiles: string[] = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts"));

  if (eventFiles.length === 0) {
    log.warn("No event files found to load");
    return;
  }

  const loadedEvents: string[] = [];
  const failedEvents: string[] = [];

  for (const file of eventFiles) {
    try {
      const filePath: string = path.join(eventsPath, file);
      const event: Event = require(filePath).default;

      // Validate event object
      if (!event || !event.name || typeof event.execute !== "function") {
        log.error(`Invalid event export in ${file}`);
        failedEvents.push(file);
        continue;
      }

      // Register event handler
      // Check if the event name is a RedisChannel enum value
      const eventName = event.name;
      const isRedisEvent = Object.values(RedisChannel).includes(
        eventName as any
      );

      if (isRedisEvent) {
        // We need to handle specific Redis channel types
        const redisEventName = eventName as keyof typeof RedisChannel;

        if (event.once) {
          client.once(redisEventName, (...args) => event.execute(...args));
        } else {
          client.on(redisEventName, (...args) => event.execute(...args));
        }
      } else {
        // For standard Discord.js events
        const discordEventName = eventName as keyof ClientEvents;

        if (event.once) {
          client.once(discordEventName, (...args) => event.execute(...args));
        } else {
          client.on(discordEventName, (...args) => event.execute(...args));
        }
      }

      loadedEvents.push(file);
      log.debug(`Loaded ${event.name} (${file})`);
    } catch (error) {
      log.error(`Failed to load event ${file}:`, error);
      failedEvents.push(file);
    }
  }

  // Log summary
  if (loadedEvents.length > 0) {
    log.info(
      `Events: Successfully loaded ${loadedEvents.length}/${eventFiles.length} events`
    );
  }

  if (failedEvents.length > 0) {
    log.warn(
      `Events: Failed to load ${
        failedEvents.length
      } events: ${failedEvents.join(", ")}`
    );
  }
};

/**
 * Recursively find all TypeScript files in a directory
 * @param dir Directory to search
 * @param fileList Array to store found files
 * @returns Array of file paths
 */
const findCommandFiles = (dir: string, fileList: string[] = []): string[] => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      findCommandFiles(filePath, fileList);
    } else if (file.endsWith(".ts")) {
      // Add TypeScript files to the list
      fileList.push(filePath);
    }
  }

  return fileList;
};

/**
 * Load command handlers from the commands directory and its subdirectories
 * @param client Discord.js client instance
 * @returns void
 */
export const loadCommands = (client: Client): void => {
  const log = logger("command-loader");

  const commandsPath: string = path.join(__dirname, "..", "commands");

  // Check if commands directory exists
  if (!fs.existsSync(commandsPath)) {
    log.error(`Commands directory not found at ${commandsPath}`);
    return;
  }

  // Find all command files recursively
  const commandFiles = findCommandFiles(commandsPath);

  if (commandFiles.length === 0) {
    log.warn("No command files found to load");
    return;
  }

  const loadedCommands: string[] = [];
  const failedCommands: string[] = [];

  for (const filePath of commandFiles) {
    try {
      // Get relative path for logging
      const relativePath = path.relative(commandsPath, filePath);

      // Import the command module
      const command: Command = require(filePath).default;

      // Validate command object
      if (!command || !("data" in command) || !("execute" in command)) {
        log.error(`Invalid command export in ${relativePath}`);
        failedCommands.push(relativePath);
        continue;
      }

      // Register command
      client.commands.set(command.data.name, command);
      loadedCommands.push(`${command.data.name} (${relativePath})`);

      log.debug(`Loaded ${command.data.name} (${relativePath})`);
    } catch (error) {
      // Get file name for error logging
      const fileName = path.basename(filePath);
      log.error(`Failed to load command ${fileName}:`, error);
      failedCommands.push(fileName);
    }
  }

  // Log summary
  if (loadedCommands.length > 0) {
    log.info(`Loaded ${loadedCommands.length}/${commandFiles.length} commands`);
  }

  if (failedCommands.length > 0) {
    log.warn(
      `Failed to load ${failedCommands.length} commands: ${failedCommands.join(
        ", "
      )}`
    );
  }
};
