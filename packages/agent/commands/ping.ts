// commands/ping.ts
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/command.types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latency information!'),

    async execute(interaction: ChatInputCommandInteraction) {

        console.log('ping command executed!');

        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;

        await interaction.editReply({
            content: `Pong! 🏓\nBot Latency: ${latency}ms\nAPI Latency: ${Math.round(interaction.client.ws.ping)}ms`,
        });
    },
};

export = command;