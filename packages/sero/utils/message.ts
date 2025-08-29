import {
  TextChannel,
  NewsChannel,
  ThreadChannel,
  Message,
  ChatInputCommandInteraction,
  MessageFlags,
  InteractionReplyOptions,
  InteractionEditReplyOptions,
} from "discord.js";

/**
 * Recursively fetches and deletes messages from a specific user
 * @param channel The channel to fetch messages from
 * @param userId The ID of the user whose messages to delete
 * @param remaining The number of messages to delete
 * @param lastId Optional ID of the last message for pagination
 * @returns The number of messages deleted
 */
export const fetchAndDeleteMessages = async (
  channel: TextChannel | NewsChannel | ThreadChannel,
  userId: string,
  remaining: number,
  lastId?: string
): Promise<number> => {
  // Create options object with proper typing
  const options: { limit: number; before?: string } = {
    limit: Math.min(remaining, 100),
  };

  if (lastId) options.before = lastId;

  const messages = await channel.messages.fetch(options);
  if (!messages || messages.size === 0) {
    return 0;
  }

  const userMessages = messages
    .filter((msg: Message) => msg.author.id === userId)
    .first(remaining);

  if (!userMessages || userMessages.length === 0) {
    return 0;
  }

  const filteredMessages = userMessages.filter((msg: Message) => msg.deletable);
  const hasNonDeletableMessages = userMessages.length > filteredMessages.length;

  const deletedMessages = await channel.bulkDelete(filteredMessages, true);
  const deletedCount = deletedMessages.size;

  const lastMessage = messages.last();

  if (
    !hasNonDeletableMessages &&
    deletedCount < remaining &&
    messages.size >= 100 &&
    lastMessage
  ) {
    const additionalDeleted = await fetchAndDeleteMessages(
      channel,
      userId,
      remaining - deletedCount,
      lastMessage.id
    );
    return deletedCount + additionalDeleted;
  }

  return deletedCount;
};

/**
 * Safely handles interaction replies with a try-catch pattern
 * @param interaction The interaction to reply to
 * @param options The reply options
 * @param isDeferred Whether the interaction has been deferred
 */
export const safeReply = async (
  interaction: ChatInputCommandInteraction,
  options: InteractionReplyOptions | string,
  isDeferred = false
): Promise<void> => {
  // Convert string to options object if needed
  const replyOptions: InteractionReplyOptions =
    typeof options === "string"
      ? { content: options, flags: MessageFlags.Ephemeral }
      : options;

  try {
    if (isDeferred) {
      // If interaction was deferred, use editReply
      await interaction.editReply(replyOptions as InteractionEditReplyOptions);
    } else {
      // Otherwise use regular reply
      await interaction.reply(replyOptions);
    }
  } catch (error) {
    // Fallback to regular reply if editReply fails
    try {
      // Ensure ephemeral flag is set for fallback
      if (!replyOptions.flags) {
        replyOptions.flags = MessageFlags.Ephemeral;
      }
      await interaction.reply(replyOptions);
    } catch (fallbackError) {
      console.error("Failed to reply to interaction:", fallbackError);
    }
  }
};

/**
 * Safely handles error responses for interactions
 * @param interaction The interaction to reply to
 * @param error The error that occurred
 * @param customMessage Optional custom message prefix
 * @param isDeferred Whether the interaction has been deferred
 */
export const safeErrorReply = async (
  interaction: ChatInputCommandInteraction,
  error: unknown,
  customMessage = "An error occurred:",
  isDeferred = false
): Promise<void> => {
  const errorMessage = `${customMessage} ${
    error instanceof Error ? error.message : "Unknown error"
  }`;
  await safeReply(
    interaction,
    { content: errorMessage, flags: MessageFlags.Ephemeral },
    isDeferred
  );
  console.error("Error in command execution:", error);
};
