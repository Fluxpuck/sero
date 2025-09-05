// Import all cron jobs
import { PublishRewardDrop } from "./reward-drop.cron";
import { PublishBirthday } from "./birthday.cron";
import { PublishRevokeTemporaryBan } from "./revoke-temporary-ban.cron";
import { logger } from "../utils/logger";

export const initCronJobs = (delay: number = 0): void => {
  logger.info("Initializing cron jobs...");

  // Register all cron jobs here
  const jobs = [PublishRewardDrop, PublishBirthday, PublishRevokeTemporaryBan];

  // Start all jobs
  jobs.forEach((job) => {
    if (job && job.start) {
      job.start();
      logger.debug(`Started ${job.name || "unnamed"}`);
    }
  });

  logger.info(`Total cron-jobs started: ${jobs.length}`);
};
