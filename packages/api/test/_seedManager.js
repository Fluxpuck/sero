const fs = require('fs');
const { join } = require('path');
const { sequelize } = require('../database/sequelize');

(async () => {

    console.log("\x1b[33m", "[SERO SEEDING MANAGER - v1.0.0]")

    // Create database connection
    await sequelize.authenticate({ logging: false });

    // Query to get a list of all tables in the 'public' schema
    const getTablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `;
    const [tablesResult] = await sequelize.query(getTablesQuery);
    const tables = tablesResult.map((row) => row.table_name);

    try {
        for (const table of tables) {
            // Truncate all database tables
            await sequelize.query(`TRUNCATE TABLE ${table} CASCADE`);
        }
    } catch (error) {
        // Throw error o.O
        throw Error("Error Truncating Tables: ", error);

    } finally {
        console.log("\x1b[34m", " → Truncated all database tables...")
        await sequelize.sync({ force: true, logging: false })
    }

    // Set Directory path to Seeder files
    const directoryPath = join(__dirname, '.', 'seeders');

    // Get the list of files and directories in the directory
    const files = fs.readdirSync(directoryPath);

    // Set the desired order for the files to be executed in...
    const desiredOrder = [
        'Commands.seed.js',
        'Levels.seed.js',
        'Guild.seed.js',
        'User.seed.js',
        'UserLevels.seed.js',
        'Jobs.seed.js',
    ];
    const desiredFilesMap = new Map(desiredOrder.map((fileName, index) => [fileName, index]));

    // Sort the files based on their presence in the desiredOrder
    const sortedFiles = files.slice().sort((fileA, fileB) => {
        const indexA = desiredFilesMap.get(fileA);
        const indexB = desiredFilesMap.get(fileB);

        // If both files are in desiredOrder or both aren't, keep their order
        if (indexA === undefined && indexB === undefined) return 0;
        if (indexA !== undefined && indexB !== undefined) return indexA - indexB;

        // If only one of the files is in desiredOrder, prioritize it
        if (indexA !== undefined) return -1;
        return 1;
    });

    // Define a function to run each seed
    const runSeed = async (file) => {
        const filePath = join(directoryPath, file);
        if (file.endsWith(".seed.js")) {
            const seed = require(filePath);
            console.log("\x1b[36m", `Executing ${file}:`);
            try {
                await seed.run();
            } catch (error) {
                console.error({ file: file, error: error });
            }
        }
    };

    // Run all seeds sequentially and wait for all to complete
    await sortedFiles.reduce(async (previousPromise, file) => {
        await previousPromise;
        return runSeed(file);
    }, Promise.resolve());

    // Finally, log that the seeding is complete
    console.log("\x1b[2m", "Seeder Completed...")

})()

return setTimeout(() => {
    process.exit(0);
}, 10_000);