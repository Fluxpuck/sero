"use strict";
// commands/ping.ts
const discord_js_1 = require("discord.js");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latency information!'),
    async execute(interaction) {
        console.log('ping command executed!');
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply({
            content: `Pong! 🏓\nBot Latency: ${latency}ms\nAPI Latency: ${Math.round(interaction.client.ws.ping)}ms`,
        });
    },
};
module.exports = command;
