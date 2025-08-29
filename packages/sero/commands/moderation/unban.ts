import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { Command } from "../../types/client.types";
import { safeReply, safeErrorReply } from "../../utils/message";

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
    await interaction.deferReply({ ephemeral: true });
    const isDeferred = interaction.deferred;

    const user = interaction.options.getUser("user");
    if (!user) {
      await safeReply(
        interaction,
        "Please provide a user to unban",
        isDeferred
      );
      return;
    }

    if (!interaction.guild) {
      await safeReply(
        interaction,
        "This command can only be used in a server",
        isDeferred
      );
      return;
    }

    // Check if the user is actually banned
    try {
      const banList = await interaction.guild.bans.fetch();
      const bannedUser = banList.find((ban) => ban.user.id === user.id);

      if (!bannedUser) {
        await safeReply(
          interaction,
          `<@${user.id}> is not banned from this server.`,
          isDeferred
        );
        return;
      }

      // Unban the user
      await interaction.guild.members.unban(
        user.id,
        `Unbanned by ${interaction.user.username}`
      );

      await safeReply(
        interaction,
        `You successfully unbanned <@${user.id}>`,
        isDeferred
      );
    } catch (error) {
      await safeErrorReply(
        interaction,
        error,
        `Could not unban <@${user.id}>.`,
        isDeferred
      );
    }

    return;
  },
};

export default command;
