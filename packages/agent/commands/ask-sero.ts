// commands/ping.ts
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types/command.types';
import { askClaudeCommand } from '../services/claude';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('ask-sero')
        .setDescription('Ask Sero a question!')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addStringOption(option =>
            option
                .setName('prompt')
                .setDescription('What would you like to ask Sero?')
                .setRequired(true)
        ) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {
        // Forward the prompt to Claude
        const prompt = interaction.options.getString('prompt', true);
        await askClaudeCommand(prompt, interaction);
    },
};

export = command;