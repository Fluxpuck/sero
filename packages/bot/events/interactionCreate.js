const { MessageFlags } = require('discord.js');
const eventEnum = require('../config/eventEnum');
const { kebabCase } = require('lodash');
const { getGuildActiveStatus } = require('../utils/cache/guild.cache');

module.exports = async (client, interaction) => {

    // Check if the guild from the interaction is active
    const isActive = await getGuildActiveStatus(interaction.guild.id);

    if (!isActive) {
        if (interaction.isRepliable()) {
            await interaction.reply({
                content: `This guild is not active. Please contact an administrator to activate it.`,
                flags: MessageFlags.Ephemeral
            });
        }
        return;
    }

    try {
        // Check if the interaction is a button
        if (interaction.isButton()) {
            client.emit(eventEnum.BUTTON_INTERACTION, interaction);
        }

        // Get the command file
        const commandFile = client.commands.get(interaction.commandName);
        if (!commandFile) return;

        // Check if the interaction has an autocomplete function
        if (interaction.isAutocomplete()) {
            commandFile.autocomplete(client, interaction);
        }

        // Check if the interaction is a command
        if (interaction.isCommand()) {
            // Check if the command has a cooldown
            // Check if the user is on a cooldown or add them to a cooldown
            if (process.env.NODE_ENV != "development") {
                if (commandFile.props.cooldown) {
                    const cooldown_key = `${interaction.user.id}_${interaction.guildId}_${kebabCase(interaction.commandName)}`;
                    const cooldown_timer = commandFile.props.cooldown;

                    // Check if the user is on a cooldown
                    if (client.cooldowns.has(cooldown_key)) {
                        const ttl = client.cooldowns.getTtl(cooldown_key);
                        const remainingTime = Math.ceil((ttl - Date.now()) / 1000); // Convert milliseconds to seconds

                        return interaction.reply({
                            content: `This command is on a cooldown! Please wait ${remainingTime} more seconds.`,
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    // Check if the command is repliable
                    if (!interaction.isRepliable()) {
                        return interaction.reply({
                            content: "Oops! The command is on a cooldown! Please wait a bit before trying again.",
                            flags: MessageFlags.Ephemeral
                        })
                    }

                    // Add the user to a cooldown
                    client.cooldowns.set(cooldown_key, interaction, cooldown_timer);
                }
            }

            // Run the command
            commandFile.run(client, interaction);
        }

    } catch (error) {
        // Handle errors with detailed information
        return console.error(`Error "${interaction.commandName}":`, error);
    }
}