const fs = require('fs');
const { join, resolve } = require('path');
const { sequelize } = require('../database/sequelize');
const { finished } = require('stream');

(async () => {

    console.log("[SEEDING MANAGER]")

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
        console.log("Truncated all database tables")
        await sequelize.sync({ force: true, logging: false })
    }

    // Set Directory path to Seeder files
    const directoryPath = join(__dirname, '.', 'seeders');

    // Get the list of files and directories in the directory
    const files = fs.readdirSync(directoryPath);

    // Set the desired order for the files to be executed in...
    const desiredOrder = ['Guild.seed.js', 'User.seed.js'];
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

    // Iterate over files array
    for (const file of sortedFiles) {

        // Get the full path of the file
        const filePath = join(directoryPath, file);

        // If the file is a Seed file, execute
        if (file.endsWith(".seed.js")) {

            // Get the Seed
            const seed = require(filePath);

            try {
                await seed.run(); // Run Seed Files in desired Order
            } catch (error) {
                console.log("[Seed Manager Error]: ", { file: file, error: error })
            } finally {
                console.log(`Executed Seed: ${file}`)
            }
        }
    }
})()