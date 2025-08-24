import { sequelize } from "../sequelize";

import { seedJobs } from "./jobs.seed";
import { seedLevels } from "./levels.seed";
import { seedRanks } from "./level-ranks.seed";
import { seedGuilds } from "./guilds.seed";
import { seedUsers } from "./users.seed";
import { seedMessages } from "./messages.seed";
import { seedTemplateMessages } from "./template-messages.seed";
import { seedPrereasonMessages } from "./prereason-messages.seed";
import { seedJobMessages } from "./job-messages.seed";

// Enhanced console color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m", // Error messages
  green: "\x1b[32m", // Success messages
  yellow: "\x1b[33m", // Warnings/cautions
  blue: "\x1b[36m", // Changed to cyan for better visibility - Process information
  magenta: "\x1b[35m", // Process termination
  grey: "\x1b[90m", // Supplementary information
  brightGreen: "\x1b[92m", // Specific success actions
  brightYellow: "\x1b[93m", // Specific action notifications
};

async function seedManager() {
  console.log(`${colors.blue}--- Seed Manager 2.0 ---${colors.reset}`);

  // Ensure database connection is established and models are synced
  try {
    await sequelize.authenticate();
    console.log(
      `${colors.brightGreen}✓ Database connection established successfully${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}✗ Error establishing database connection:${colors.reset}`,
      error
    );
    process.exit(1);
  }

  // Truncate all tables in the database
  try {
    console.log(
      `${colors.brightYellow}» Truncating all tables...${colors.reset}`
    );
    for (const model of Object.values(sequelize.models)) {
      await model.destroy({ truncate: true, cascade: true, force: true });
      console.log(
        `${colors.grey}  Truncated table: ${
          colors.green
        }${model.getTableName()}${colors.reset}`
      );
    }
    console.log(
      `${colors.brightGreen}✓ All models truncated successfully${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}✗ Error truncating tables:${colors.reset}`,
      error
    );
    process.exit(1);
  }

  // Seed the database
  try {
    console.log(
      `${colors.blue}» Starting data seeding process...${colors.reset}`
    );

    await seedJobs();
    console.log(`${colors.green}✓ Jobs seeded successfully${colors.reset}`);

    await seedLevels();
    console.log(`${colors.green}✓ Levels seeded successfully${colors.reset}`);

    await seedRanks();
    console.log(`${colors.green}✓ Ranks seeded successfully${colors.reset}`);

    await seedGuilds();
    console.log(`${colors.green}✓ Guilds seeded successfully${colors.reset}`);

    await seedUsers();
    console.log(`${colors.green}✓ Users seeded successfully${colors.reset}`);

    await seedMessages(50);
    console.log(`${colors.green}✓ Messages seeded successfully${colors.reset}`);

    await seedTemplateMessages();
    console.log(`${colors.green}✓ Template messages seeded successfully${colors.reset}`);

    await seedPrereasonMessages();
    console.log(`${colors.green}✓ Prereason messages seeded successfully${colors.reset}`);

    await seedJobMessages();
    console.log(`${colors.green}✓ Job messages seeded successfully${colors.reset}`);
  } catch (error) {
    console.error(
      `${colors.red}✗ Error seeding database:${colors.reset}`,
      error
    );
    process.exit(1);
  } finally {
    console.log(
      `${colors.brightGreen}✓ Seeding completed successfully${colors.reset}`
    );
  }
}

seedManager(); // Run the seedManager function

setTimeout(() => {
  console.log(
    `${colors.magenta}» Closing process after 10 seconds...${colors.reset}`
  );
  process.exit(0); // Exit process with success code
}, 10_000);
