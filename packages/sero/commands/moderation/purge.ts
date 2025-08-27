import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../types/client.types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Purge messages from a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to purge messages from")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Type the amount of messages to purge")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ) as SlashCommandBuilder,
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    return;
  },
};

export default command;
