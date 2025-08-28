import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { Command } from "../../types/client.types";
import { checkPermissions } from "../../utils/permissions";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Revoke a ban from a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to unban")
        .setRequired(true)
    ) as SlashCommandBuilder,
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    if (!user) {
      interaction.reply({
        content: "Please provide a user",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const member = interaction.guild?.members.cache.get(user.id);
    if (!member) {
      interaction.reply({
        content: "User not found",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await interaction.guild?.members.unban(user.id);
      interaction.reply({
        content: `You successfully unbanned <@${member.user.id}>`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      interaction.reply({
        content: `Could not unban <@${member.user.id}>.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    return;
  },
};

export default command;
