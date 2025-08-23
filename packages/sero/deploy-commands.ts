// deploy-commands.ts
import dotenv from "dotenv";
import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { Command } from "./types/client.types";
import { logger } from "./utils/logger";

dotenv.config({ path: path.join(__dirname, ".", "config", ".env") });

const commands: any[] = [];
const commandsPath: string = path.join(__dirname, "commands");
const commandFiles: string[] = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts"));

for (const file of commandFiles) {
  const filePath: string = path.join(commandsPath, file);
  const command: Command = require(filePath);

  if ("data" in command) {
    commands.push(command.data.toJSON());
  } else {
    logger.warn(
      `The command at ${filePath} is missing a required "data" property.`
    );
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
    logger.info("Fetching existing commands...");
    const existingCommands = (await rest.get(
      Routes.applicationCommands(process.env.CLIENT_ID!)
    )) as any[];

    logger.info(
      `Started refreshing ${commands.length} application (/) commands globally.`
    );

    // The put method is used to fully refresh all commands
    // Using applicationCommands instead of applicationGuildCommands for global commands
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!),
      { body: commands }
    );

    logger.success(
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
        logger.info(
          `Detected ${
            removedCommands.length
          } removed command(s): ${removedCommands
            .map((cmd) => cmd.name)
            .join(", ")}`
        );
      }
    }

    logger.info(
      "Note: Global commands can take up to 1 hour to update across all servers."
    );
  } catch (error) {
    logger.error("Error deploying commands:", error);
  }
})();
