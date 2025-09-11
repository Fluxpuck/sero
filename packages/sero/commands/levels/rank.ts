import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../types/client.types";
import { getRequest } from "../../database/connection";
import { ResponseStatus } from "../../types/response.types";
import { createRankCard } from "../../utils/rank";
import { safeErrorReply, safeReply } from "../../utils/message";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Show your rank or another user's rank")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to get the rank of")
        .setRequired(false)
    ) as SlashCommandBuilder,
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const isDeferred = true; // Always true since we're deferring above

    try {
      const targetUser =
        interaction.options.getUser("user") || interaction.user;
      const username = targetUser.globalName || targetUser.username;

      const response = await getRequest(
        `/guild/${interaction.guildId}/levels/${targetUser.id}`
      );

      if (response.status === ResponseStatus.FAIL) {
        safeReply(
          interaction,
          {
            content: `${username} doesn't have any rank data yet! They need to send some messages first.`,
          },
          isDeferred,
          false
        );
        return;
      }

      if (response.status !== ResponseStatus.SUCCESS) {
        let error = new Error(response.message || "Unknown error");
        safeErrorReply(
          interaction,
          error,
          "Oops! Something went wrong while trying to fetch the rank data.",
          isDeferred
        );
        return;
      }

      // Get request details
      const {
        level,
        experience,
        position,
        currentLevelExp,
        nextLevelExp,
        remainingExp,
      } = response.data.userLevel;

      const rankCard = await createRankCard(
        targetUser.id,
        username,
        targetUser.displayAvatarURL({
          forceStatic: true,
          extension: "png",
          size: 1024,
        }),
        position,
        experience,
        level,
        currentLevelExp,
        nextLevelExp,
        remainingExp
      );

      if (!rankCard) {
        return safeReply(
          interaction,
          {
            content:
              "Failed to generate the rank card. Please try again later.",
          },
          isDeferred,
          true
        );
      }

      const isOwnRank = targetUser.id === interaction.user.id;
      return safeReply(
        interaction,
        {
          content: isOwnRank
            ? "Here's your rank card!"
            : `Here's ${username}'s rank card!`,
          files: [rankCard],
        },
        isDeferred
      );
    } catch (error) {
      safeErrorReply(
        interaction,
        error,
        "An unexpected error occurred. Please try again later.",
        isDeferred
      );
      return;
    }
  },
};

export default command;
