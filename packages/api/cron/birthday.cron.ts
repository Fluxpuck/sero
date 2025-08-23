import { CronJob } from "cron";
import { logger } from "../utils/logger";

import {
  GuildSettings,
  GuildSettingType,
} from "../models/guild-settings.model";

import { publish, RedisChannel } from "../redis/publisher";

export const PublishBirthday = new CronJob(
  "0 15 * * *", // Cron expression: At 15:00 (3 PM) UTC every day

  async function () {
    try {
      logger.info("Initializing Birthday Message Distribution");

      // Find all guilds with birthday channel setup
      const dropGuilds = await GuildSettings.findAll({
        where: {
          type: GuildSettingType.BIRTHDAY_MESSAGE_CHANNEL,
        },
      });

      // Distribute birthday messages to guilds
      if (dropGuilds.length > 0) {
        await Promise.all(
          dropGuilds.map(async (record) => {
            publish(RedisChannel.GUILD_MEMBER_BIRTHDAY, {
              guildId: record.guildId,
              channelId: record.targetId,
            });
            logger.debug(
              `Published birthday message for guild ${record.guildId}`
            );
            return Promise.resolve();
          })
        );
      }

      logger.info(
        `Birthday Messages Distributed successfully to ${dropGuilds.length} guilds`
      );
    } catch (error) {
      logger.error("Error in Birthday cron-job:", error);
    }
  },

  // onComplete function
  null,

  // start immediately
  false,

  // timezone
  "UTC",

  // context
  null,

  // runOnInit
  false
);

// Set the name property
PublishBirthday.name = "birthday-message";
