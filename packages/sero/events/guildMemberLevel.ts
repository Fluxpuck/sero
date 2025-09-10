import {
  Client,
  Guild,
  TextChannel,
  NewsChannel,
  ThreadChannel,
  GuildMember,
} from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";
import { UserLevelData } from "../types/models/user-levels.types";
import { getRequest } from "../database/connection";
import { ResponseStatus } from "../types/response.types";

const event: Event = {
  name: RedisChannel.GUILD_MEMBER_LEVEL,
  once: false,
  async execute(message: UserLevelData, client: Client): Promise<any> {
    if (!message || !client) return; // Skip empty messages
    logger.debug(`Processing level message`, message);

    try {
      const guild = await client.guilds.fetch(message.guildId);
      if (!guild) return;

      const member = await guild.members.fetch(message.userId);
      if (!member) return;

      // Get levelup channel and levelup message data
      const [targetChannel, levelupMessageData] = await Promise.all([
        getRequest(`/guild/${message.guildId}/settings/level-up-channel`),
        getRequest(
          `/guild/${message.guildId}/assets/template-messages/random/levelup`
        ),
      ]);

      if (targetChannel.status !== ResponseStatus.SUCCESS) {
        logger.error(
          `Failed to find level-up-channel for guild ${guild.id}`,
          targetChannel.message
        );
        return;
      }

      // Get levelup channel and levelup message
      const targetChannelId = targetChannel.data.targetId;
      const levelupMessage =
        levelupMessageData?.data?.message ||
        "{{USER}} has reached level {{LEVEL}}!";

      const channel = await client.channels.fetch(targetChannelId);
      const textChannel = channel as TextChannel | NewsChannel | ThreadChannel;
      if (!channel || !textChannel) return;

      // Send levelup message
      await textChannel.send(
        levelupMessage
          .replace("{{USER}}", `<@${member.id}>`)
          .replace("{{LEVEL}}", message.level.toString())
      );

      logger.debug(`Sent level-up message to ${member.user.username}`);
    } catch (error) {
      logger.error(`Error processing level message: ${error}`);
    }
  },
};

export default event;
