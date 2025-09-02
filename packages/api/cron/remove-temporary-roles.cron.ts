import { CronJob } from "cron";
import { Op } from "sequelize";
import { logger } from "../utils/logger";

import { TemporaryRole } from "../models/temporary-roles.model";
import { publish, RedisChannel } from "../redis/publisher";

export const PublishRevokeTemporaryBan = new CronJob(
  "0 0 * * *", // Cron expression: At midnight (00:00) UTC every day

  async function () {
    try {
      logger.info("Checking for expired Temporary Roles");

      // Find all expired temporary roles
      const expired = await TemporaryRole.findAll({
        where: {
          expireAt: {
            [Op.lte]: new Date(),
          },
        },
      });

      // Distribute revoke temporary role messages to guilds
      if (expired.length > 0) {
        await Promise.all(
          expired.map(async (record) => {
            publish(RedisChannel.GUILD_MEMBER_TEMPORARY_ROLE, {
              guildId: record.guildId,
              userId: record.userId,
              roleId: record.roleId,
            });
            logger.debug(
              `Published revoke temporary role message for ${record.userId} in ${record.guildId}`
            );
            return Promise.resolve();
          })
        );
      }

      logger.info(`Revoked temporary role for ${expired.length} users`);
    } catch (error) {
      logger.error("Error in Revoke Temporary Role cron-job:", error);
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
