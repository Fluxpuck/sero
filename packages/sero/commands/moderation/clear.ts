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
import { isTextChannel, isBulkDeletable } from "../../utils/channel";
import { safeReply, safeErrorReply } from "../../utils/message";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear messages from a channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Type the amount of messages to clear")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ) as SlashCommandBuilder,
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const isDeferred = interaction.deferred;

    const amount = interaction.options.getInteger("amount");
    if (!amount) {
      await safeReply(
        interaction,
        "Please provide an amount of messages to clear",
        isDeferred
      );
      return;
    }

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

    try {
      // Pass true as second parameter to automatically filter out messages older than 14 days
      const deletedMessages = await channel.bulkDelete(amount, true);
      const deletedCount = deletedMessages.size;

      if (deletedCount === 0) {
        await safeReply(
          interaction,
          "No messages found to delete.",
          isDeferred
        );
      } else {
        await safeReply(
          interaction,
          `Successfully cleared ${deletedCount} messages.`,
          isDeferred
        );
      }
    } catch (error) {
      await safeErrorReply(
        interaction,
        error,
        "An error occurred while clearing messages. Some messages may be too old to delete (>14 days).",
        isDeferred
      );
    }

    return;
  },
};

export default command;
