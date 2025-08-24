import { TemplateMessages, TemplateMessagesType } from "../../models";
import { logger } from "../../utils/logger";

/**
 * Seed template messages with default welcome messages and away reasons
 * Migrated from SQL migration file: messages.sql
 */
export async function seedTemplateMessages() {
  try {
    // Define welcome message templates (no guild ID for default templates)
    const welcomeMessages = [
      "{name}! We are happy to have you here!",
      "Hello {name}, glad to see you!",
      "We are delighted to have you among us {name}.",
      "We are thrilled to have {name} here.",
      "We hope you'll have an amazing time here {name}!",
      "Hope you'll enjoy it here {name}!",
      "We are very excited to have you, {name}",
      "You hit the join button and joined {name}!",
      "Want a cup of tea? We got coffee too!",
      "Hey {name}, hope you brought some pizza!",
      "{name}, we have been waiting for you!",
      "We are so excited, {name} finally joined the server!",
      "We smile and wave to you {name}, glad to see you!",
      "Salute {name}, enjoy your time here!",
      "Hi {name}, we're happy to see you in here!",
      "WOW! It's {name}, glad to see you!",
    ];

    // Define away reason templates (no guild ID for default templates)
    const awayMessages = [
      "{name} is away for a while. They will be back soon!",
      "{name} is currently unavailable. Please try again later.",
      "{name} stepped away from the keyboard. They'll return shortly!",
      "Sorry, {name} is AFK at the moment.",
      "{name} is taking a short break. They'll be back in a bit!",
      "{name} is busy right now. Please leave a message after the beep!",
      "{name} is temporarily away. They'll respond when they return.",
      "{name} had to step out for a moment. They'll be back soon!",
      "{name} is currently on a break. Please be patient.",
      "{name} is away from their desk. They'll check messages later.",
    ];

    // Create welcome template messages
    for (const message of welcomeMessages) {
      await TemplateMessages.create({
        guildId: null, // null for default templates
        type: TemplateMessagesType.WELCOME,
        message,
      } as TemplateMessages);
    }

    // Create away template messages
    for (const message of awayMessages) {
      await TemplateMessages.create({
        guildId: null, // null for default templates
        type: TemplateMessagesType.AWAY,
        message,
      } as TemplateMessages);
    }

    // Log success message
    logger.success(
      `${
        welcomeMessages.length + awayMessages.length
      } template messages have been seeded successfully.`
    );
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error seeding template messages: ${errorMessage}`);
    return { success: false, error };
  }
}
