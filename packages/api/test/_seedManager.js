/*  FluxAPI © 2023 Fluxpuck
The SeedManager fetches and executes all seeds */

// → require packages & functions
const fs = require('fs');
const { join, resolve } = require('path');
const { sequelize } = require('../database/sequelize');

(async () => {

    // Authenticate to the Database
    await sequelize.sync();

    // Fetch all Tables from the Database
    const query = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`
    const [results] = await sequelize.query(query);
    const tables = results.map((row) => row.table_name);


    try {
        for (const table of tables) {

            console.log(table)

            // await sequelize.query(`DROP TABLE ${table} CASCADE`);
        }
    } catch (error) {
        console.log("[ERROR]: ", error)
    } finally {
        await sequelize.sync();
    }







    return;

    // Set Directory path to Seeder files
    const directoryPath = join(__dirname, '.', 'seeders');

    // Get the list of files and directories in the directory
    const files = fs.readdirSync(directoryPath);

    // Iterate over files array
    for (const file of files) {

        // Get the full path of the file
        const filePath = join(directoryPath, file);

        // If the file is a Seed file, execute
        if (file.endsWith(".seed.js")) {

            // Get the Seed
            const seed = require(filePath);

            try {
                // Run the seed file
                seed.run();
            } catch (error) {
                console.log("[Seed Manager Error]:", { seed: seed, error: error })
            }
        }
    }
})()