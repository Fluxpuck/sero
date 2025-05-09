import { sequelize } from '../sequelize';
import chalk from 'chalk';

import { seedGuilds } from './guilds.seed';
import { seedUsers } from './users.seed';
import { seedMessages } from './messages.seed';

(async () => {
    console.log(chalk.blue("Seeding database..."));

    // Ensure database connection is established and models are synced
    try {
        await sequelize.authenticate();
        console.log(chalk.green('Database connection established successfully'));
    } catch (error) {
        console.error(chalk.red('Error establishing database connection:'), error);
        process.exit(1);
    }

    // Truncate all tables in the database
    try {
        console.log(chalk.yellow('Truncating all tables...'));
        for (const model of Object.values(sequelize.models)) {
            await model.destroy({ truncate: true, cascade: true, force: true });
            console.log(chalk.green(`Truncated table: ${model.getTableName()}`));
        }
        console.log(chalk.green('All models truncated successfully'));
    } catch (error) {
        console.error(chalk.red('Error truncating tables:'), error);
        process.exit(1);
    }

    // Seed the database
    try {
        console.log(chalk.blue('Seeding data...'));

        await seedGuilds();
        console.log(chalk.green('Guilds seeded successfully'));

        await seedUsers();
        console.log(chalk.green('Users seeded successfully'));

        await seedMessages(50);
        console.log(chalk.green('Messages seeded successfully'));

    } catch (error) {
        console.error(chalk.red('Error seeding database:'), error);
        process.exit(1);
    } finally {
        console.log(chalk.green('Seeding completed successfully'));
    }
})();

setTimeout(() => {
    console.log(chalk.magenta('Closing process after 10 seconds...'));
    process.exit(0); // Exit process with success code
}, 10_000);