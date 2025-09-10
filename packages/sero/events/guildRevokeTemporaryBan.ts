import { Client } from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";

type GuildRevokeTemporaryBanData = {
  guildId: string;
  userId: string;
};

const event: Event = {
  name: RedisChannel.GUILD_REVOKE_TEMPORARY_BAN,
  once: false,
  async execute(
    message: GuildRevokeTemporaryBanData,
    client: Client
  ): Promise<any> {
    if (!message || !client) return; // Skip empty messages
    logger.debug("Processing revoke temporary ban message", message);

    try {
      const guild = client.guilds.cache.get(message.guildId);
      if (!guild) return;

      const member = guild.members.cache.get(message.userId);
      if (!member) return;

      // Unban the user
      await guild.members.unban(message.userId);

      logger.debug(`Revoked temporary ban for ${member.user.username}`);
    } catch (error) {
      logger.error(`Error processing revoke temporary ban message`, error);
    }
  },
};

export default event;
