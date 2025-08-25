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
    } else if (file.endsWith('.ts')) {
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
  const commandsPath: string = path.join(__dirname, "..", "commands");
  
  // Check if commands directory exists
  if (!fs.existsSync(commandsPath)) {
    logger.error(`Commands directory not found at ${commandsPath}`);
    return;
  }
  
  // Find all command files recursively
  const commandFiles = findCommandFiles(commandsPath);
    
  if (commandFiles.length === 0) {
    logger.warn("No command files found to load");
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
      if (!command || !('data' in command) || !('execute' in command)) {
        logger.error(`Invalid command export in ${relativePath}`);
        failedCommands.push(relativePath);
        continue;
      }
      
      // Register command
      client.commands.set(command.data.name, command);
      loadedCommands.push(`${command.data.name} (${relativePath})`);
      
      if (process.env.NODE_ENV === "development") {
        logger.debug(`Command loaded: ${command.data.name} (${relativePath})`);
      }
    } catch (error) {
      // Get file name for error logging
      const fileName = path.basename(filePath);
      logger.error(`Failed to load command ${fileName}:`, error);
      failedCommands.push(fileName);
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
