"use strict";
// commands/ping.ts
const discord_js_1 = require("discord.js");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latency information!'),
    async execute(interaction) {
        try {
            // Defer the reply to prevent timeout
            const sent = await interaction.deferReply({ fetchReply: true });
            // Calculate latency
            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            const apiPing = Math.round(interaction.client.ws.ping);
            // Edit the deferred reply with the ping information
            await interaction.editReply({
                content: `Pong! 🏓\nBot Latency: ${latency}ms\nAPI Latency: ${apiPing}ms`,
            });
        }
        catch (error) {
            console.error('Error in ping command:', error);
            // Handle the error gracefully
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply('There was an error executing the ping command!');
            }
            else {
                await interaction.reply({
                    content: 'There was an error executing the ping command!',
                    ephemeral: true
                });
            }
        }
    },
};
module.exports = command;
