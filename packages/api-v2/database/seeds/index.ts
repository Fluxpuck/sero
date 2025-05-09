import { seedGuilds } from './guilds.seed';
import { seedMessages } from './messages.seed';
import { sequelize } from '../sequelize';

(async () => {
    console.log("Seeding database...");

    // Ensure database connection is established and models are synced
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Truncate all tables in the database
    try {
        console.log('Truncating all tables...');
        for (const model of Object.values(sequelize.models)) {
            await model.destroy({ truncate: true, cascade: true, force: true });
            console.log(`Truncated table: ${model.getTableName()}`);
        }
    } catch (error) {
        console.error('Error truncating tables:', error);
        process.exit(1); // Exit process with error code
    } finally {
        console.log('All models truncated successfully');
    }

    try {
        await seedGuilds();
        await seedMessages(50);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1); // Exit process with error code
    } finally {
        console.log('Seeding completed successfully');
    }

})()

setTimeout(() => {
    console.log('Closing process after 10 seconds...');
    process.exit(0); // Exit process with success code
}, 10_000);