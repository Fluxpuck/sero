import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  MessageFlags,
  TextChannel,
  NewsChannel,
  ThreadChannel,
} from "discord.js";
import { Command } from "../../types/client.types";
import { isBulkDeletable } from "../../utils/channel";
import {
  fetchAndDeleteMessages,
  safeReply,
  safeErrorReply,
} from "../../utils/message";

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
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const isDeferred = interaction.deferred;

    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    if (!user || !amount) {
      await safeReply(
        interaction,
        "Please provide a user and an amount",
        isDeferred
      );
      return;
    }

    const member = interaction.guild?.members.cache.get(user.id);
    if (!member) {
      await safeReply(interaction, "User not found", isDeferred);
      return;
    }

    try {
      // Type guard to ensure channel supports bulk delete
      if (!interaction.channel || !isBulkDeletable(interaction.channel)) {
        await safeReply(
          interaction,
          "Cannot delete messages in this type of channel",
          isDeferred
        );
        return;
      }

      const channel = interaction.channel as
        | TextChannel
        | NewsChannel
        | ThreadChannel;
      const deletedCount = await fetchAndDeleteMessages(
        channel,
        user.id,
        amount
      );

      if (deletedCount === 0) {
        await safeReply(
          interaction,
          `No messages found from ${user.tag} to delete.`,
          isDeferred
        );
      } else {
        await safeReply(
          interaction,
          `Successfully purged ${deletedCount} messages from ${user.tag}.`,
          isDeferred
        );
      }
    } catch (error) {
      await safeErrorReply(
        interaction,
        error,
        "An error occurred while purging messages. Some messages may be too old to delete (>14 days).",
        isDeferred
      );
    }

    return;
  },
};

export default command;
