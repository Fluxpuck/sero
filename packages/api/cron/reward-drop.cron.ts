import { CronJob } from "cron";
import { logger } from "../utils/logger";
import {
  GuildSettings,
  GuildSettingType,
} from "../models/guild-settings.model";
import { publish, RedisChannel } from "../redis/publisher";

const log = logger("reward-drop");

const MIN_DELAY = 2 * 60 * 1000; // 2 minutes in milliseconds
const MAX_DELAY = 30 * 60 * 1000; // 30 minutes in milliseconds

export const PublishRewardDrop = new CronJob(
  "*/30 * * * *", // Cron expression: Every 30 minutes

  async function () {
    try {
      log.info("Initializing Reward Drops Distribution");

      const dropGuilds = await GuildSettings.findAll({
        where: {
          type: GuildSettingType.EXP_REWARD_DROP_CHANNEL,
        },
      });

      if (dropGuilds.length > 0) {
        const publishDrops = dropGuilds.map(async (record) => {
          const randomDelay =
            MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);

          await new Promise<void>((resolve) =>
            setTimeout(resolve, randomDelay)
          );

          publish(RedisChannel.GUILD_DROP_REWARD, {
            guildId: record.guildId,
            channelId: record.targetId,
          });

          log.debug(`Published reward drop for guild ${record.guildId}`);
        });

        await Promise.all(publishDrops);
      }

      log.info(
        `Reward Drops Distributed successfully to ${dropGuilds.length} guilds`
      );
    } catch (error) {
      log.error("Error in Reward Drops cron-job", error);
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
PublishRewardDrop.name = "reward-drop";
