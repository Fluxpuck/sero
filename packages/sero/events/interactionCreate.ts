import { Events, Interaction, MessageFlags } from "discord.js";
import { Event } from "../types/client.types";
import { logger } from "../utils/logger";
import { postRequest } from "../database/connection";
import { useCooldown } from "../utils/cooldown";

const event: Event = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction: Interaction): Promise<any> {
    // Ignore interactions from bots
    if (interaction.user.bot) return;

    // Ignore non-guild interactions
    if (!interaction.inGuild() || !interaction.guild?.available) return;

    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        logger.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      if (command.cooldown) {
        // Use the cooldown hook for this command
        const commandCooldown = useCooldown(
          interaction.client,
          interaction.guildId!,
          interaction.user.id,
          command.data.name
        );

        // Check if the user is on cooldown
        if (commandCooldown.onCooldown()) {
          const remainingTime = commandCooldown.timeLeft();

          return interaction.reply({
            content: `This command is on a cooldown! Please wait ${remainingTime} more seconds.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        // Set the cooldown before executing the command
        commandCooldown.setCooldown(command.cooldown);
      }

      try {
        // Execute the command
        await command.execute(interaction);

        // Log the command execution
        const commandLog = await postRequest(
          `/logs/${interaction.guildId}/command`,
          {
            commandName: interaction.commandName,
            executorId: interaction.user.id,
            commandOptions: interaction.options.data,
          }
        );

        logger.debug("Command logged successfully", commandLog);
      } catch (error) {
        logger.error(`Error executing ${interaction.commandName}:`, error);

        if (process.env.NODE_ENV === "development") {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: "There was an error while executing this command!",
              flags: MessageFlags.Ephemeral,
            });
          } else {
            await interaction.reply({
              content: "There was an error while executing this command!",
              flags: MessageFlags.Ephemeral,
            });
          }
        }
      }
    }

    // Handle message component interactions (buttons, select menus)
    else if (interaction.isMessageComponent()) {
      // You can add custom handling for buttons/select menus here
      logger.debug(`Received component interaction: ${interaction.customId}`);
    }

    // Handle modal submissions
    else if (interaction.isModalSubmit()) {
      // You can add custom handling for modal submissions here
      logger.debug(`Received modal submission: ${interaction.customId}`);
    }

    // Handle autocomplete interactions
    else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command || !("autocomplete" in command)) {
        logger.error(
          `No autocomplete handler for ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        // This assumes you have an autocomplete method in some commands
        // You'll need to add this to your Command interface
        if ("autocomplete" in command && command.autocomplete) {
          await command.autocomplete(interaction);
        }
      } catch (error) {
        logger.error(
          `Error handling autocomplete for ${interaction.commandName}:`,
          error
        );
      }
    }
  },
};

export default event;
