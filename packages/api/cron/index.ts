// Import all cron jobs
import { PublishRewardDrop } from "./reward-drop.cron";
import { PublishBirthday } from "./birthday.cron";

export const initCronJobs = (delay: number = 0): void => {
  console.info("Initializing cron jobs...");

  // Register all cron jobs here
  const jobs = [PublishRewardDrop, PublishBirthday];

  // Start all jobs
  jobs.forEach((job) => {
    if (job && job.start) {
      job.start();
      console.info(`Cron job "${job.name || "unnamed"}" started`);
    }
  });

  console.info(`${jobs.length} cron jobs initialized`);
};
