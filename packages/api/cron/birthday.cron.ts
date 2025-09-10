import { CronJob } from "cron";
import { logger } from "../utils/logger";
import { getMonth, getDate } from "date-fns";

import {
  GuildSettings,
  GuildSettingType,
} from "../models/guild-settings.model";
import { UserBirthdays } from "../models/user-birthdays.model";
import { publish, RedisChannel } from "../redis/publisher";

const log = logger("birthday");

export const PublishBirthday = new CronJob(
  "0 14 * * *", // Cron expression: At 14:00 (2 PM) UTC every day

  async function () {
    try {
      log.info("Initializing Birthday Message Distribution");

      const [birthdayChannels, birthdayRoles] = await Promise.all([
        GuildSettings.findAll({
          where: {
            type: GuildSettingType.BIRTHDAY_CHANNEL,
          },
        }),
        GuildSettings.findAll({
          where: {
            type: GuildSettingType.BIRTHDAY_ROLE,
          },
        }),
      ]);

      const birthdayPromises = birthdayChannels.map(async (channel) => {
        const roleId = birthdayRoles.find(
          (role) => role.guildId === channel.guildId
        )?.targetId;
        if (!roleId) return;

        const birthdays = await UserBirthdays.findAll({
          where: {
            guildId: channel.guildId,
            month: getMonth(new Date()) + 1,
            day: getDate(new Date()),
          },
        });
        if (birthdays.length <= 0) return;

        publish(RedisChannel.GUILD_MEMBER_BIRTHDAY, {
          guildId: channel.guildId,
          channelId: channel.targetId,
          roleId,
          birthdays,
        });

        log.debug(`Published birthday messages for guild ${channel.guildId}`);
      });

      await Promise.all(birthdayPromises);
    } catch (error) {
      log.error("Error in Birthday cron-job:", error);
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
