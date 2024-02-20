const { Levels } = require("../../database/models");

module.exports.run = async () => {

    const levelsData = require("../data/levels.json");

    for (const levelInfo of levelsData) {
        try {
            // Check if the job already exists
            const existingLevel = await Levels.findOne({
                where: { level: levelInfo.level }
            });

            if (existingLevel) {
                // Job already exists, update its data
                await existingLevel.update(levelInfo);
            } else {
                // Job doesn't exist, create a new record
                await Levels.create(levelInfo);
            }
        } catch (error) {
            console.error(`Error creating/updating levels: ${error.message}`);
        }
    }


}