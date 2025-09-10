import { Client } from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";

const log = logger("guild-member-temporary-role");

type GuildMemberTemporaryRoleData = {
  guildId: string;
  userId: string;
  roleId: string;
};

const event: Event = {
  name: RedisChannel.GUILD_MEMBER_TEMPORARY_ROLE,
  once: false,
  async execute(
    message: GuildMemberTemporaryRoleData,
    client: Client
  ): Promise<any> {
    if (!message || !client) return; // Skip empty messages
    log.debug("Processing temporary role message", message);

    try {
      const guild = client.guilds.cache.get(message.guildId);
      if (!guild) return;

      const member = guild.members.cache.get(message.userId);
      if (!member) return;

      // Remove the temporary role
      await member.roles.remove(message.roleId);

      log.debug(`Revoked temporary role for ${member.user.username}`);
    } catch (error) {
      log.error(`Error processing temporary role message`, error);
    }
  },
};

export default event;
