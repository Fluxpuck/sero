import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../types/client.types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear messages from a channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    return;
  },
};

export default command;
