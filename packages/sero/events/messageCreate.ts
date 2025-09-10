import { Message, Events } from "discord.js";
import { Event } from "../types/client.types";
import { logger } from "../utils/logger";
import { postRequest } from "../database/connection";
import { useCooldown } from "../utils/cooldown";

const log = logger("message-create");

const event: Event = {
  name: Events.MessageCreate,
  once: false,
  async execute(message: Message): Promise<any> {
    // Skip empty messages or messages from bots
    if (!message || !message.content || message.author.bot) return;

    // Check if the message is from a guild
    if (!message.guild) return;

    // Create a cooldown hook for XP gain with a 60-second cooldown per user
    const xpCooldown = useCooldown(
      message.client,
      message.guildId!,
      message.author.id,
      "xp-gain"
    );

    // Only execute the getRequest if the user is not on cooldown
    if (!xpCooldown.onCooldown()) {
      // Set a 60-second cooldown
      xpCooldown.setCooldown(60);

      // Execute the request to gain XP
      const result = await postRequest(
        `/guild/${message.guildId}/levels/gain/${message.author.id}`
      );
      log.debug(
        `${message.author.tag} gained ${result.data.fluctuation} XP`,
        result
      );
    }
  },
};

export default event;
