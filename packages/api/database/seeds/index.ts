import { sequelize } from "../sequelize";
import { logger } from "../../utils/logger";

import { seedJobs } from "./jobs.seed";
import { seedLevels } from "./levels.seed";
import { seedRanks } from "./level-ranks.seed";
import { seedGuilds } from "./guilds.seed";
import { seedUsers } from "./users.seed";
import { seedMessages } from "./messages.seed";
import { seedTemplateMessages } from "./template-messages.seed";
import { seedPrereasonMessages } from "./prereason-messages.seed";
import { seedJobMessages } from "./job-messages.seed";
import { seedUserAuditLogs } from "./user-audit-logs.seed";

// Colors are now handled by the logger utility

async function seedManager() {
  logger.info(`--- Seed Manager 2.0 ---`);

  // Ensure database connection is established and models are synced
  try {
    await sequelize.authenticate();
    logger.success(`✓ Database connection established successfully`);
  } catch (error) {
    logger.error(`✗ Error establishing database connection:`, error);
    process.exit(1);
  }

  // Truncate all tables in the database
  try {
    logger.info(`» Syncing models...`);
    await sequelize.sync({ alter: true });
    logger.info(`» Truncating all tables...`);
    for (const model of Object.values(sequelize.models)) {
      await model.destroy({ truncate: true, cascade: true, force: true });
      logger.info(`  Truncated table: ${model.getTableName()}`);
    }
    logger.success(`✓ All models truncated successfully`);
  } catch (error) {
    logger.error(`✗ Error truncating tables:`, error);
    process.exit(1);
  }

  // Seed the database
  try {
    logger.info(`» Starting data seeding process...`);

    await seedJobs();
    logger.success(`✓ Jobs seeded successfully`);

    await seedLevels();
    logger.success(`✓ Levels seeded successfully`);

    await seedRanks();
    logger.success(`✓ Ranks seeded successfully`);

    await seedGuilds();
    logger.success(`✓ Guilds seeded successfully`);

    await seedUsers();
    logger.success(`✓ Users seeded successfully`);

    await seedMessages(50);
    logger.success(`✓ Messages seeded successfully`);

    await seedTemplateMessages();
    logger.success(`✓ Template messages seeded successfully`);

    await seedPrereasonMessages();
    logger.success(`✓ Prereason messages seeded successfully`);

    await seedJobMessages();
    logger.success(`✓ Job messages seeded successfully`);

    await seedUserAuditLogs(220);
    logger.success(`✓ User audit logs seeded successfully`);
  } catch (error) {
    logger.error(`✗ Error seeding database:`, error);
    process.exit(1);
  } finally {
    logger.success(`✓ Seeding completed successfully`);
  }
}

seedManager(); // Run the seedManager function

setTimeout(() => {
  logger.info(`» Closing process after 10 seconds...`);
  process.exit(0); // Exit process with success code
}, 10_000);
