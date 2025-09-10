import { CronJob } from "cron";
import { Op } from "sequelize";
import { logger } from "../utils/logger";
import { TemporaryBan } from "../models/temporary-bans.model";
import { publish, RedisChannel } from "../redis/publisher";

const log = logger("revoke-temporary-ban");

export const PublishRevokeTemporaryBan = new CronJob(
  "0 0 * * *", // Cron expression: At midnight (00:00) UTC every day

  async function () {
    try {
      log.info("Checking for expired Temporary Bans");

      // Find all expired temporary bans
      const expired = await TemporaryBan.findAll({
        where: {
          expireAt: {
            [Op.lte]: new Date(),
          },
        },
      });

      // Distribute revoke temporary ban messages to guilds
      if (expired.length > 0) {
        await Promise.all(
          expired.map(async (record) => {
            publish(RedisChannel.GUILD_REVOKE_TEMPORARY_BAN, {
              guildId: record.guildId,
              userId: record.userId,
            });
            log.debug(
              `Published revoke temporary ban message for ${record.userId} in ${record.guildId}`
            );
            return Promise.resolve();
          })
        );
      }

      log.info(`Revoked temporary ban for ${expired.length} users`);
    } catch (error) {
      log.error("Error in Revoke Temporary Ban cron-job:", error);
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
PublishRevokeTemporaryBan.name = "revoke-temporary-ban";
