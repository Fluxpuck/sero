const { Jobs } = require("../../database/models");

module.exports.run = async () => {

    const jobsData = require("../data/jobs.json");

    for (const jobInfo of jobsData) {
        try {
            // Check if the job already exists
            const existingJob = await Jobs.findOne({
                where: {
                    userId: jobInfo.userId,
                    guildId: jobInfo.guildId
                }
            });

            if (existingJob) {
                // Job already exists, update its data
                await existingJob.update(jobInfo);
            } else {
                // Job doesn't exist, create a new record
                await Jobs.create(jobInfo);
            }
        } catch (error) {
            console.error(`Error creating/updating jobs: ${error.message}`);
        }
    }

}