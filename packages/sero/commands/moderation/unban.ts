import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../types/client.types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Revoke a ban from a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    return;
  },
};

export default command;
