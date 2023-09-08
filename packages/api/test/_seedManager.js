/*  FluxAPI © 2023 Fluxpuck
The SeedManager fetches and executes all seeds */

// → require packages & functions
const fs = require('fs');
const { join, resolve } = require('path');
const { sequelize } = require('../database/sequelize');

(async () => {

    // Sync to the Database
    await sequelize.sync({ logging: false });

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
                seed.run();
            } catch (error) {
                console.log("[Seed Manager Error]:", error)
            }
        }

    }

})()