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

      const response = await getRequest(
        `/guild/${interaction.guildId}/levels/${targetUser.id}`
      );

      console.log("response", response);

      if (response.status === ResponseStatus.FAIL) {
        return safeReply(
          interaction,
          {
            content: `${targetUser.username} doesn't have any rank data yet! They need to send some messages first.`,
          },
          isDeferred,
          false
        );
      }

      if (response.status !== ResponseStatus.SUCCESS) {
        let error = new Error(response.message || "Unknown error");

        return safeErrorReply(
          interaction,
          error,
          "Oops! Something went wrong while trying to fetch the rank data.",
          isDeferred
        );
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
        targetUser.username,
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
            : `Here's ${targetUser.username}'s rank card!`,
          files: [rankCard],
        },
        isDeferred
      );
    } catch (error) {
      console.error(
        "Error in rank command:",
        error instanceof Error ? error.message : String(error)
      );
      return safeErrorReply(
        interaction,
        error,
        "An unexpected error occurred. Please try again later.",
        isDeferred
      );
    }
  },
};

export default command;
