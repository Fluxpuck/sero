import fs from "fs";
import path from "path";
import { Client } from "discord.js";
import { Command, Event } from "../types/client.types";
import { logger } from "./logger";

/**
 * Load event handlers from the events directory
 * @param client Discord.js client instance
 * @returns void
 */
export const loadEvents = (client: Client): void => {
  const eventsPath: string = path.join(__dirname, "..", "events");
  
  // Check if events directory exists
  if (!fs.existsSync(eventsPath)) {
    logger.error(`Events directory not found at ${eventsPath}`);
    return;
  }
  
  const eventFiles: string[] = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts"));
    
  if (eventFiles.length === 0) {
    logger.warn("No event files found to load");
    return;
  }
  
  const loadedEvents: string[] = [];
  const failedEvents: string[] = [];
  
  for (const file of eventFiles) {
    try {
      const filePath: string = path.join(eventsPath, file);
      const event: Event = require(filePath).default;
      
      // Validate event object
      if (!event || !event.name || typeof event.execute !== 'function') {
        logger.error(`Invalid event export in ${file}`);
        failedEvents.push(file);
        continue;
      }
      
      // Register event handler
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
      
      loadedEvents.push(file);
      
      if (process.env.NODE_ENV === "development") {
        logger.debug(`Event loaded: ${event.name} (${file})`);
      }
    } catch (error) {
      logger.error(`Failed to load event ${file}:`, error);
      failedEvents.push(file);
    }
  }
  
  // Log summary
  if (loadedEvents.length > 0) {
    logger.info(`Events: Successfully loaded ${loadedEvents.length}/${eventFiles.length} events`);
  }
  
  if (failedEvents.length > 0) {
    logger.warn(`Events: Failed to load ${failedEvents.length} events: ${failedEvents.join(', ')}`);
  }
};

/**
 * Load command handlers from the commands directory
 * @param client Discord.js client instance
 * @returns void
 */
export const loadCommands = (client: Client): void => {
  const commandsPath: string = path.join(__dirname, "..", "commands");
  
  // Check if commands directory exists
  if (!fs.existsSync(commandsPath)) {
    logger.error(`Commands directory not found at ${commandsPath}`);
    return;
  }
  
  const commandFiles: string[] = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));
    
  if (commandFiles.length === 0) {
    logger.warn("No command files found to load");
    return;
  }
  
  const loadedCommands: string[] = [];
  const failedCommands: string[] = [];
  
  for (const file of commandFiles) {
    try {
      const filePath: string = path.join(commandsPath, file);
      const command: Command = require(filePath).default;
      
      // Validate command object
      if (!command || !('data' in command) || !('execute' in command)) {
        logger.error(`Invalid command export in ${file}`);
        failedCommands.push(file);
        continue;
      }
      
      // Register command
      client.commands.set(command.data.name, command);
      loadedCommands.push(`${command.data.name} (${file})`);
      
      if (process.env.NODE_ENV === "development") {
        logger.debug(`Command loaded: ${command.data.name} (${file})`);
      }
    } catch (error) {
      logger.error(`Failed to load command ${file}:`, error);
      failedCommands.push(file);
    }
  }
  
  // Log summary
  if (loadedCommands.length > 0) {
    logger.info(`Commands: Successfully loaded ${loadedCommands.length}/${commandFiles.length} commands`);
  }
  
  if (failedCommands.length > 0) {
    logger.warn(`Commands: Failed to load ${failedCommands.length} commands: ${failedCommands.join(', ')}`);
  }
};
