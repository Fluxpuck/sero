import { ClientEvents, SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';

export type Command = {
    data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    cooldown?: number; // Optional cooldown in seconds
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export type Event = {
    name: keyof ClientEvents;
    once: boolean;
    execute: (...args: any[]) => void | Promise<void>;
}
