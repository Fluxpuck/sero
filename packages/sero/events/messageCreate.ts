import { Message, Events, Client } from "discord.js";
import { Event } from "../types/client.types";
import { logger } from "../utils/logger";
import { getRequest } from "../database/connection";
import { useCooldown } from "../utils/cooldown";

const event: Event = {
  name: Events.MessageCreate,
  once: false,
  async execute(message: Message, client: Client): Promise<any> {
    // Skip empty messages or messages from bots
    if (!message || !message.content || message.author.bot) return;

    // Check if the message is from a guild
    if (!message.guild) return;

    // Create a cooldown hook for XP gain with a 60-second cooldown per user
    const xpCooldown = useCooldown(
      client,
      message.guildId!,
      message.author.id,
      "xp-gain"
    );

    // Only execute the getRequest if the user is not on cooldown
    if (!xpCooldown.onCooldown()) {
      // Set a 60-second cooldown
      xpCooldown.setCooldown(60);

      // Execute the request to gain XP
      const result = await getRequest(
        `/guild/${message.guildId}/levels/gain/${message.author.id}`
      );
      logger.debug(`XP gained for ${message.author.tag}`, result);
    }
  },
};

export default event;
