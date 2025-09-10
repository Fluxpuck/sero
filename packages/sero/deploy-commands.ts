// deploy-commands.ts
import dotenv from "dotenv";
import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { Command } from "./types/client.types";
import { logger } from "./utils/logger";

dotenv.config({ path: path.join(__dirname, ".", "config", ".env") });

const log = logger("deploy-commands");

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

const commands: any[] = [];
const commandsPath: string = path.join(__dirname, "commands");

// Find all command files recursively
const commandFiles: string[] = findCommandFiles(commandsPath);

log.info(`Found ${commandFiles.length} command files in ${commandsPath} and its subdirectories`);

for (const filePath of commandFiles) {
  try {
    // Get relative path for logging
    const relativePath = path.relative(commandsPath, filePath);
    const command: Command = require(filePath).default;

    if ("data" in command) {
      commands.push(command.data.toJSON());
      log.debug(`Registered command: ${command.data.name} (${relativePath})`);
    } else {
      log.warn(
        `The command at ${relativePath} is missing a required "data" property.`
      );
    }
  } catch (error) {
    const fileName = path.basename(filePath);
    log.error(`Error loading command ${fileName}:`, error);
  }
}

if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is missing in the environment variables");
}

if (!process.env.CLIENT_ID) {
  throw new Error("CLIENT_ID is missing in the environment variables");
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    // First, get the existing commands to check what needs to be deleted
    log.info("Fetching existing commands...");
    const existingCommands = (await rest.get(
      Routes.applicationCommands(process.env.CLIENT_ID!)
    )) as any[];

    log.info(
      `Started refreshing ${commands.length} application (/) commands globally.`
    );

    // The put method is used to fully refresh all commands
    // Using applicationCommands instead of applicationGuildCommands for global commands
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!),
      { body: commands }
    );

    log.success(
      `Successfully reloaded ${
        Array.isArray(data) ? data.length : 0
      } global application (/) commands.`
    );

    // Check if any commands were removed
    if (existingCommands && Array.isArray(existingCommands)) {
      const newCommandNames = commands.map((cmd) => cmd.name);
      const removedCommands = existingCommands.filter(
        (cmd) => !newCommandNames.includes(cmd.name)
      );

      if (removedCommands.length > 0) {
        log.info(
          `Detected ${
            removedCommands.length
          } removed command(s): ${removedCommands
            .map((cmd) => cmd.name)
            .join(", ")}`
        );
      }
    }

    log.info(
      "Note: Global commands can take up to 1 hour to update across all servers."
    );
  } catch (error) {
    log.error("Error deploying commands:", error);
  }
})();
