// commands/ping.ts
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types/command.types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latency information!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction: ChatInputCommandInteraction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`Pong! 🏓 (${latency}ms)`);
    },
};

export = command;