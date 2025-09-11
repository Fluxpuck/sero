import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { safeReply, safeErrorReply } from "../../utils/message";
import { Command } from "../../types/client.types";
import { postRequest } from "../../database/connection";
import { ResponseCode, ResponseStatus } from "../../types/response.types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer your experience to another user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to transfer your experience to")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of experience to transfer")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(2000)
    ) as SlashCommandBuilder,
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (!targetUser) {
      await safeReply(
        interaction,
        "You must specify a user to transfer experience to.",
        false,
        true
      );
      return;
    }

    if (targetUser.id === interaction.user.id) {
      await safeReply(
        interaction,
        "You cannot transfer experience to yourself.",
        false,
        true
      );
      return;
    }

    // Request the transfer exp route
    const response = await postRequest(
      `/guild/${interaction.guildId}/levels/transfer/${interaction.user.id}`,
      { amount, targetId: targetUser.id }
    );

    if (response.status === ResponseStatus.SUCCESS) {
      const {
        dailyTransferLimit,
        actualTransferAmount,
        remainingTransferLimit,
      } = response.data;

      // Create a simple success message
      let successMessage = `Successfully transferred **${actualTransferAmount} XP** to ${targetUser}!`;

      // Add information about daily transfer limit remaining
      successMessage += `\n-# You can transfer **${remainingTransferLimit} XP** more today.`;

      // Check if the amount was adjusted due to limits
      if (amount !== null && actualTransferAmount < amount) {
        if (response.message.includes("daily limit")) {
          successMessage += `\n-# PS: Transfer was limited by your daily transfer limit of ${dailyTransferLimit} XP.`;
        } else {
          successMessage += `\n-# PS: Transfer was limited to your available experience.`;
        }
      }

      await safeReply(interaction, successMessage);
    } else {
      // Handle specific error cases
      let errorMessage = `Failed to transfer experience to ${targetUser.username}.`;
      let error = new Error(response.message || "Unknown error");

      switch (response.code) {
        case ResponseCode.BAD_REQUEST:
          if (response.message.includes("daily transfer limit")) {
            errorMessage =
              "You have reached your daily transfer limit of 2000 experience.";
          } else if (response.message.includes("don't have any experience")) {
            errorMessage = "You don't have any experience to transfer.";
          }
          break;
        case ResponseCode.PREMIUM_REQUIRED:
          errorMessage =
            "This feature requires premium. Please upgrade to continue.";
          break;
      }

      await safeErrorReply(interaction, error, errorMessage, true);
    }
  },
};

export default command;
