// Import all cron jobs
import { PublishRewardDrop } from "./reward-drop.cron";
import { PublishBirthday } from "./birthday.cron";
import { PublishRevokeTemporaryBan } from "./revoke-temporary-ban.cron";
import { logger } from "../utils/logger";

const log = logger("cron-job-manager");

export const initCronJobs = (delay: number = 0): void => {
  log.info("Initializing cron jobs...");

  // Register all cron jobs here
  const jobs = [PublishRewardDrop, PublishBirthday, PublishRevokeTemporaryBan];

  // Start all jobs
  jobs.forEach((job) => {
    if (job && job.start) {
      job.start();
      log.debug(`Started ${job.name || "unnamed"}`);
    }
  });

  log.info(`Total cron-jobs started: ${jobs.length}`);
};
