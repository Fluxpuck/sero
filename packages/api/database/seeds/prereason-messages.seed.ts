import { PrereasonMessages, ModerationType } from "../../models";
import { logger } from "../../utils/logger";

/**
 * Seed prereason messages with default moderation reason messages
 * Migrated from SQL migration file: messages.sql and reason-messages.js
 */
export async function seedPrereasonMessages() {
  try {
    // Define kick reason messages
    const kickReasons = [
      "Impersonating a staff member or another user.",
      "Having an innapropriate username.",
      "Using an alt account.",
      "Multiple server rule infringements.",
      "Saying racial slurs in chat.",
      "Violating Discord Terms of Service.",
      "Posting NSFW content.",
      "Being under the age of 12, violating Discord ToS.",
    ];

    // Define mute reason messages
    const muteReasons = [
      "Spamming excessively in a chat.",
      "Cursing excessively in a chat.",
      "Bullying another member.",
      "Speaking in a foreign language.",
      "Mini-modding.",
      "Creating drama in the chat.",
      "Using special characters excessively in a chat.",
      "Typing in all caps excessively in a chat.",
      "Advertising a server or website.",
      "Talking about inappropriate things in a chat.",
    ];

    // Define ban reason messages (same as kick in the JS file)
    const banReasons = [
      "Impersonating a staff member or another user.",
      "Having an innapropriate username.",
      "Using an alt account.",
      "Multiple server rule infringements.",
      "Saying racial slurs in chat.",
      "Violating Discord Terms of Service.",
      "Posting NSFW content.",
      "Being under the age of 12, violating Discord ToS.",
    ];

    // Define warn reason messages
    const warnReasons = [
      "Impersonation of a staff member or another user.",
      "You have an innapropriate username.",
      "You account has been flagged as an alt account.",
      "This is a warning for multiple server rule infringements.",
      "Using racial slurs in chat.",
      "Violating Discord Terms of Service",
      "Posting NSFW content.",
      "Being under the age of 12, violating Discord ToS.",
    ];

    // Create kick reason messages
    for (const message of kickReasons) {
      await PrereasonMessages.create({
        type: ModerationType.KICK,
        message,
      } as PrereasonMessages);
    }

    // Create mute reason messages
    for (const message of muteReasons) {
      await PrereasonMessages.create({
        type: ModerationType.MUTE,
        message,
      } as PrereasonMessages);
    }

    // Create ban reason messages
    for (const message of banReasons) {
      await PrereasonMessages.create({
        type: ModerationType.BAN,
        message,
      } as PrereasonMessages);
    }

    // Note: WARN type doesn't exist in ModerationType enum
    // Storing warn messages as MUTE type since they're similar in nature
    for (const message of warnReasons) {
      await PrereasonMessages.create({
        type: ModerationType.WARN,
        message,
      } as PrereasonMessages);
    }

    logger.success(
      `Seeded ${kickReasons.length} kick reason messages, ${muteReasons.length} mute reason messages, ${banReasons.length} ban reason messages, and ${warnReasons.length} warn reason messages.`
    );
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error seeding prereason messages: ${errorMessage}`);
    return { success: false, error };
  }
}
