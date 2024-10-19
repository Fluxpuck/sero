const { Jobs } = require("../../database/models");

module.exports.run = async () => {
    const jobsData = require("../data/jobs.json");

    for (const jobInfo of jobsData) {
        try {
            await Jobs.upsert(jobInfo);
        } catch (error) {
            console.error(`Error upserting jobs: ${error.message}`);
        }
    }
}