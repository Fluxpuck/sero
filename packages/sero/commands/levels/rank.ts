import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../types/client.types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Show your rank")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    // Show the user's rank
    // with a rank-card

    return;
  },
};

export default command;
