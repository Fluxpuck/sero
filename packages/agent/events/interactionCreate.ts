// events/interactionCreate.ts
import { Events, Interaction, MessageFlags } from 'discord.js';
import { Event } from '../types/client.types';

// Track cooldowns for commands and users
const cooldowns = new Map<string, Map<string, number>>();

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
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            if (command.cooldown) {

                // Check if the command has a cooldown
                const cooldown_key = `${interaction.user.id}_${interaction.guildId}_${command.data.name}`;

                // Check if the user is on a cooldown
                if (interaction.client.cooldowns.has(cooldown_key)) {

                    const expireTime = interaction.client.cooldowns.get(cooldown_key) as number;
                    const remainingTime = Math.ceil((expireTime - Date.now()) / 1000);

                    return interaction.reply({
                        content: `This command is on a cooldown! Please wait ${remainingTime} more seconds.`,
                        flags: MessageFlags.Ephemeral
                    });
                }

                // Add the user to a cooldown - store the expiration timestamp
                const expirationTime = Date.now() + (command.cooldown * 1000);
                interaction.client.cooldowns.set(cooldown_key, expirationTime, command.cooldown);
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}:`, error);

                const replyOptions = {
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(replyOptions);
                } else {
                    await interaction.reply(replyOptions);
                }
            }
        }

        // Handle message component interactions (buttons, select menus)
        else if (interaction.isMessageComponent()) {
            // You can add custom handling for buttons/select menus here
            console.log(`Received component interaction: ${interaction.customId}`);
        }

        // Handle modal submissions
        else if (interaction.isModalSubmit()) {
            // You can add custom handling for modal submissions here
            console.log(`Received modal submission: ${interaction.customId}`);
        }

        // Handle autocomplete interactions
        else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command || !('autocomplete' in command)) {
                console.error(`No autocomplete handler for ${interaction.commandName} was found.`);
                return;
            }

            try {
                // This assumes you have an autocomplete method in some commands
                // You'll need to add this to your Command interface
                if ('autocomplete' in command && command.autocomplete) {
                    await command.autocomplete(interaction);
                }
            } catch (error) {
                console.error(`Error handling autocomplete for ${interaction.commandName}:`, error);
            }
        }
    },
};

export = event;