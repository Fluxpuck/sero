const { Levels } = require("../../database/models");

module.exports.run = async () => {

    // Load the levels data from the levels.json file
    const levelsData = require("../data/levels.json");

    try {
        await Levels.bulkCreate(levelsData, { updateOnDuplicate: ['level'] });
        console.log("\x1b[34m", ` → Bulk created ${levelsData.length} levels`);
    } catch (error) {
        console.error(`Error bulk creating levels: ${error.message}`);
    }
}