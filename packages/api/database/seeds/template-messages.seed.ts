import { TemplateMessages, TemplateMessagesType } from "../../models";
import { logger } from "../../utils/logger";

const log = logger("template-messages-seed");

/**
 * Seed template messages with default welcome messages and away reasons
 * Migrated from SQL migration file: messages.sql
 */
export async function seedTemplateMessages() {
  try {
    // Define welcome message templates
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

    // Define away reason templates
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

    // Define reward drop templates
    const rewardDropMessages = [
      "✨ A mysterious reward drop appears out of nowhere!",
      "Woohoo! A shiny reward drop just spawned!",
      "🌟 A reward chest has been discovered!",
      "Sero has gifted you a reward drop 🎁",
      "👀 Is that... a reward drop?",
      "☔ It’s raining rewards again!",
      "🔥 A reward drop landed right in front of you!",
      "💫 A glowing aura surrounds a new reward drop!",
      "🎲 A random reward drop has spawned. Feeling lucky?",
      "📦 A secret package has dropped from the sky!",
      "🎉 A reward drop just spawned—who’s grabbing it first?",
    ];

    // Define claim reward templates
    const claimRewardMessages = [
      "🎉 Congrats {{USER}}, you grabbed **{{AMOUNT}}** experience!",
      "⚡ {{USER}} was the fastest and snatched **{{AMOUNT}}** experience!",
      "🚀 Quick as lightning, {{USER}} claimed **{{AMOUNT}}** experience.",
      "🔥 {{USER}} secured **{{AMOUNT}}** experience before anyone else could!",
      "🎊 Boom! {{USER}} just earned **{{AMOUNT}}** experience.",
      "✨ {{USER}} claimed a shiny reward worth **{{AMOUNT}}** experience!",
      "🏆 {{USER}} is the winner this time with **{{AMOUNT}}** experience!",
      "💎 {{USER}} grabbed the loot and got **{{AMOUNT}}** experience.",
      "🥇 First place goes to {{USER}} with **{{AMOUNT}}** experience!",
      "⚔️ {{USER}} fought off the competition and claimed **{{AMOUNT}}** experience!",
    ];

    const birthdayMessages = [
      "Happy birthday, {NAME}! Have fun! 🎉",
      "Enjoy your day, {NAME}! 🎂",
      "It’s your day, {NAME}! Celebrate big! 🎈",
      "Happy birthday, {NAME}! Party time! 🎉",
      "Best wishes, {NAME}! Have a great day! 🎁",
      "Cheers, {NAME}! Happy birthday! 🍰",
      "Smile bright, {NAME}! Happy birthday! 😊",
      "Enjoy, {NAME}! Happy birthday! 🎉",
      "Happy birthday, {NAME}! Adventure time! 🎈",
    ];

    const birthdayWithAgeMessages = [
      "Happy {AGE}th, {NAME}! Enjoy! 🎉",
      "Congrats on {AGE}, {NAME}! 🎂",
      "{NAME}, you rock at {AGE}! Happy birthday! 🎈",
      "Happy birthday, {NAME}, you cool {AGE}-year-old! 🎉",
      "{AGE} cheers, {NAME}! Have fun! 🎁",
      "Awesome {AGE}th, {NAME}! Enjoy! 🍰",
      "Happy Birthday, {NAME}! Have {AGE} times the fun! 😊",
      "{NAME}, {AGE} is just the start! Happy birthday! 🎉",
      "{NAME}, {AGE} wishes come true! Happy birthday! 🎈",
      "Happy birthday, {NAME}! {AGE} looks great on you! 🎁",
    ];

    const levelupMessages = [
      "Your journey to greatness continues! {{USER}} has leveled up to **level {{LEVEL}}**! 🎉",
      "Congratulations! {{USER}} has just unlocked a new level of awesomeness at **level {{LEVEL}}**! 🌟",
      "Level up! {{USER}}'s typing-skills is reaching new heights at **level {{LEVEL}}**! 🚀",
      "{{USER}}'s fast fingers helped them reach **level {{LEVEL}}**! 👈",
      "You've made your presence known! {{USER}} has reached **level {{LEVEL}}**! ",
      "Level up! {{USER}}'s typing-skills is reaching legendary status at **level {{LEVEL}}**! 🏆",
      "{{USER}} has reached **level {{LEVEL}}**! The sky's the limit! 🌌",
      "{{USER}} has reached **level {{LEVEL}}**. Keep up the amazing work! 💪",
      "{{USER}} has just leveled up to **level {{LEVEL}}**! The adventure only gets more exciting from here! 🗺️",
      "Level up achieved! {{USER}}'s dedication is paying off at **level {{LEVEL}}**! 🏆",
      "Milestone achieved! {{USER}} has advanced to **level {{LEVEL}}**! 🏅",
      "{{USER}} just reached **level {{LEVEL}}**! That's what we call progress! ⚡",
      "Look who's climbing the ranks! {{USER}} is now at **level {{LEVEL}}**! 🧗",
      "{{USER}} leveled up to **level {{LEVEL}}**! New skills unlocked! 🔓",
      "The grind pays off! {{USER}} has reached **level {{LEVEL}}**! 💯",
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

    // Create reward drop template messages
    for (const message of rewardDropMessages) {
      await TemplateMessages.create({
        guildId: null, // null for default templates
        type: TemplateMessagesType.REWARD_DROP,
        message,
      } as TemplateMessages);
    }

    // Create claim reward template messages
    for (const message of claimRewardMessages) {
      await TemplateMessages.create({
        guildId: null, // null for default templates
        type: TemplateMessagesType.CLAIM_REWARD,
        message,
      } as TemplateMessages);
    }

    // Create birthday template messages
    for (const message of birthdayMessages) {
      await TemplateMessages.create({
        guildId: null, // null for default templates
        type: TemplateMessagesType.BIRTHDAY,
        message,
      } as TemplateMessages);
    }

    // Create birthday age template messages
    for (const message of birthdayWithAgeMessages) {
      await TemplateMessages.create({
        guildId: null, // null for default templates
        type: TemplateMessagesType.BIRTHDAY_WITH_AGE,
        message,
      } as TemplateMessages);
    }

    // Create levelup template messages
    for (const message of levelupMessages) {
      await TemplateMessages.create({
        guildId: null, // null for default templates
        type: TemplateMessagesType.LEVELUP,
        message,
      } as TemplateMessages);
    }

    // Log success message
    log.success(
      `Seeded ${welcomeMessages.length} welcome messages, ${awayMessages.length} away messages, ${rewardDropMessages.length} reward drop messages, and ${claimRewardMessages.length} claim reward messages.`
    );
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log.error(`Error seeding template messages: ${errorMessage}`);
    return { success: false, error };
  }
}
