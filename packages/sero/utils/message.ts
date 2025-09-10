import {
  TextChannel,
  NewsChannel,
  ThreadChannel,
  Message,
  ChatInputCommandInteraction,
  MessageFlags,
  InteractionReplyOptions,
  InteractionEditReplyOptions,
  ButtonInteraction,
} from "discord.js";
import { subMinutes } from "date-fns";
import { isAfter } from "date-fns";
import { logger } from "../utils/logger";

const log = logger("message-utils");

/**
 * Get unique authors from the last X minutes of messages in a channel
 * @param channel The channel to fetch messages from
 * @param time The time in minutes to look back
 * @returns An array of unique author IDs
 */
export const getUniqueAuthorsFromMessages = async (
  channel: TextChannel | NewsChannel | ThreadChannel,
  time: number = 5
) => {
  // Fetch the last 100 messages in the channel
  const messages = await channel.messages.fetch({ limit: 100 });

  // Calculate the time 5 minutes ago
  const timeAgo = subMinutes(new Date(), time);

  // Filter messages from the last 5 minutes
  const recentMessages = messages.filter((msg) =>
    isAfter(msg.createdTimestamp, timeAgo)
  );

  // Create an array with all unique message.author.id's
  const uniqueAuthorIds = [
    ...new Set(recentMessages.map((msg) => msg.author.id)),
  ];

  // Return the array of unique author IDs (will be empty if no messages match the criteria)
  return uniqueAuthorIds;
};

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
 * @param ephemeral Whether the message should be ephemeral (only visible to the user who triggered it)
 */
export const safeReply = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  options: InteractionReplyOptions | string,
  isDeferred = false,
  ephemeral = false
): Promise<void> => {
  // Convert string to options object if needed
  const replyOptions: InteractionReplyOptions =
    typeof options === "string"
      ? {
          content: options,
          flags: ephemeral ? MessageFlags.Ephemeral : undefined,
        }
      : {
          ...options,
          flags: ephemeral ? MessageFlags.Ephemeral : options.flags,
        };

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
      log.error("Failed to reply to interaction:", fallbackError);
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
  log.error("Error in command execution:", error);
};
