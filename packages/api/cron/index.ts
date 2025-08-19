// Import all cron jobs
import { PublishRewardDrop } from "./reward-drop.cron";
import { PublishBirthday } from "./birthday.cron";
import { logger } from "../utils/logger";

export const initCronJobs = (delay: number = 0): void => {
  logger.info("Initializing cron jobs...");

  // Register all cron jobs here
  const jobs = [PublishRewardDrop, PublishBirthday];

  // Start all jobs
  jobs.forEach((job) => {
    if (job && job.start) {
      job.start();
      logger.info(`Cron job "${job.name || "unnamed"}" started`);
    }
  });

  logger.info(`${jobs.length} cron jobs initialized`);
};
