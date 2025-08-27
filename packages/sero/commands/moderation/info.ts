import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../types/client.types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Get information about a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    return;
  },
};

export default command;
