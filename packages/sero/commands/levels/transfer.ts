import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../types/client.types";
import { postRequest } from "../../database/connection";
import { ResponseCode } from "../../types/response.types";

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
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (!targetUser) {
      await interaction.editReply({
        content: "You must specify a user to transfer experience to.",
      });
      return;
    }

    if (targetUser.id === interaction.user.id) {
      await interaction.editReply({
        content: "You cannot transfer experience to yourself.",
      });
      return;
    }

    // Request the transfer exp route
    const response = await postRequest(
      `/guild/${interaction.guildId}/levels/transfer/${interaction.user.id}`,
      { amount, targetId: targetUser.id }
    );

    if (response.code === ResponseCode.SUCCESS) {
      const { transferredAmount, originUserLevel, targetUserLevel } =
        response.data;

      // Create an embed for a nicer response
      const embed = new EmbedBuilder()
        .setTitle("Experience Transfer")
        .setColor("#00FF00")
        .setDescription(`Successfully transferred experience to ${targetUser}!`)
        .addFields(
          {
            name: "Amount Transferred",
            value: `${transferredAmount} XP`,
            inline: true,
          },
          {
            name: "Your Remaining XP",
            value: `${originUserLevel.experience} XP`,
            inline: true,
          },
          {
            name: `${targetUser.username}'s New XP`,
            value: `${targetUserLevel.experience} XP`,
            inline: true,
          }
        )
        .setTimestamp();

      // Check if the amount was adjusted due to limits
      if (amount !== null && transferredAmount < amount) {
        if (response.message.includes("daily limit")) {
          embed.setFooter({
            text: "Note: Transfer was limited by your daily transfer limit of 2000 XP",
          });
        } else {
          embed.setFooter({
            text: "Note: Transfer was limited to your available experience",
          });
        }
      }

      await interaction.editReply({
        embeds: [embed],
      });
    } else {
      let errorMessage = `Failed to transfer experience to ${targetUser.username}.`;

      // Handle specific error cases
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

      await interaction.editReply({
        content: errorMessage,
      });
    }
  },
};

export default command;
