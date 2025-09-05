import { CronJob } from "cron";
import { logger } from "../utils/logger";
import { getMonth, getDate } from "date-fns";

import {
  GuildSettings,
  GuildSettingType,
} from "../models/guild-settings.model";
import { UserBirthdays } from "../models/user-birthdays.model";
import { publish, RedisChannel } from "../redis/publisher";

export const PublishBirthday = new CronJob(
  "*/2 * * * *", // Cron expression: Every 2 minutes
  // "0 15 * * *", // Cron expression: At 15:00 (3 PM) UTC every day

  async function () {
    try {
      logger.info("Initializing Birthday Message Distribution");

      // Find all guilds with birthday channel setup
      const dropGuilds = await GuildSettings.findAll({
        where: {
          type: GuildSettingType.BIRTHDAY_CHANNEL,
        },
      });

      // Distribute birthday messages to guilds
      if (dropGuilds.length > 0) {
        await Promise.all(
          dropGuilds.map(async (record) => {
            // Get birthday channel and all today's birthdays
            const [birthdayRole, birthdayUsers] = await Promise.all([
              GuildSettings.findOne({
                where: {
                  guildId: record.guildId,
                  type: GuildSettingType.BIRTHDAY_ROLE,
                },
              }),
              UserBirthdays.findAll({
                where: {
                  guildId: record.guildId,
                  month: getMonth(new Date()) + 1,
                  day: getDate(new Date()),
                },
              }),
            ]);
            if (!birthdayRole || birthdayUsers.length <= 0) return;

            // Publish birthday messages to Redis
            publish(RedisChannel.GUILD_MEMBER_BIRTHDAY, {
              guildId: record.guildId,
              channelId: record.targetId,
              roleId: birthdayRole.targetId,
              birthdays: birthdayUsers,
            });

            logger.debug(
              `Published birthday messages for guild ${record.guildId}`
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
