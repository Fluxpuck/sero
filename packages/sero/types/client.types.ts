import {
  ClientEvents,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { RedisChannel } from "../redis/subscribe";

export type Command = {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandSubcommandsOnlyBuilder;
  cooldown?: number; // Optional cooldown in seconds
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
};

export type Event = {
  name: keyof ClientEvents | RedisChannel;
  once: boolean;
  execute: (...args: any[]) => void | Promise<void>;
};
