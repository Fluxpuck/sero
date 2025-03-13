import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction} from 'discord.js';

export type Command = {
    data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}