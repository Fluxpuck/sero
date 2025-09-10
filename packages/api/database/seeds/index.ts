import { sequelize } from "../sequelize";

import { seedJobs } from "./jobs.seed";
import { seedLevels } from "./levels.seed";
import { seedRanks } from "./level-ranks.seed";
import { seedGuilds } from "./guilds.seed";
import { seedGuildSettings } from "./guild-settings.seed";
import { seedUsers } from "./users.seed";
import { seedMessages } from "./messages.seed";
import { seedTemplateMessages } from "./template-messages.seed";
import { seedPrereasonMessages } from "./prereason-messages.seed";
import { seedJobMessages } from "./job-messages.seed";
import { seedUserAuditLogs } from "./user-audit-logs.seed";
import { logger } from "../../utils/logger";

const log = logger("seed-manager");

async function seedManager() {
  log.info(`--- Seed Manager 2.0 ---`);

  // Ensure database connection is established and models are synced
  try {
    await sequelize.authenticate();
    log.success(`✓ Database connection established successfully`);
  } catch (error) {
    log.error(`✗ Error establishing database connection:`, error);
    process.exit(1);
  }

  // Truncate all tables in the database
  try {
    log.info(`» Syncing models...`);
    await sequelize.sync({ alter: true });
    log.info(`» Truncating all tables...`);
    for (const model of Object.values(sequelize.models)) {
      await model.destroy({ truncate: true, cascade: true, force: true });
      log.info(`  Truncated table: ${model.getTableName()}`);
    }
    log.success(`✓ All models truncated successfully`);
  } catch (error) {
    log.error(`✗ Error truncating tables:`, error);
    process.exit(1);
  }

  // Seed the database
  try {
    log.info(`» Starting data seeding process...`);

    await seedJobs();
    log.success(`✓ Jobs seeded successfully`);

    await seedLevels();
    log.success(`✓ Levels seeded successfully`);

    await seedRanks();
    log.success(`✓ Ranks seeded successfully`);

    await seedGuilds();
    log.success(`✓ Guilds seeded successfully`);

    await seedGuildSettings();
    log.success(`✓ Guilds-settings seeded successfully`);

    await seedUsers();
    log.success(`✓ Users seeded successfully`);

    await seedMessages(50);
    log.success(`✓ Messages seeded successfully`);

    await seedTemplateMessages();
    log.success(`✓ Template messages seeded successfully`);

    await seedPrereasonMessages();
    log.success(`✓ Prereason messages seeded successfully`);

    await seedJobMessages();
    log.success(`✓ Job messages seeded successfully`);

    await seedUserAuditLogs(220);
    log.success(`✓ User audit logs seeded successfully`);
  } catch (error) {
    log.error(`✗ Error seeding database:`, error);
    process.exit(1);
  } finally {
    log.success(`✓ Seeding completed successfully`);
  }
}

seedManager(); // Run the seedManager function

setTimeout(() => {
  log.info(`» Closing process after 10 seconds...`);
  process.exit(0); // Exit process with success code
}, 10_000);
