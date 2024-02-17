const { Jobs } = require("../../database/models");

module.exports.run = async () => {

    const jobsData = [
        {
            jobId: "1",
            name: "Veterinarian",
            description: "Provides medical care to animals.",
            wage: 60000,
        },
        {
            jobId: "2",
            name: "Astronaut",
            description: "Travels to space for scientific research or exploration.",
            wage: 75000,
        },
        {
            jobId: "3",
            name: "Lawyer",
            description: "Provides legal advice and representation.",
            wage: 60000,
        },
        {
            jobId: "4",
            name: "Accountant",
            description: "Manages financial records and prepares reports.",
            wage: 50000,
        },
        {
            jobId: "5",
            name: "Developer",
            description: "Creates software applications and systems.",
            wage: 60000,
        },
        {
            jobId: "6",
            name: "Teacher",
            description: "Educates students in various subjects.",
            wage: 40000,
        },
        {
            jobId: "7",
            name: "Police Officer",
            description: "Enforces laws and maintains public order.",
            wage: 50000,
        },
        {
            jobId: "8",
            name: "Sales Person",
            description: "Sells products or services to customers.",
            wage: 30000,
        },
        {
            jobId: "9",
            name: "Travel Agent",
            description: "Assists clients in planning and booking trips.",
            wage: 30000,
        },
        {
            jobId: "10",
            name: "Athlete",
            description: "Competes in sports professionally.",
            wage: 25000,
        },
        {
            jobId: "11",
            name: "Youtuber",
            description: "Creates and publishes video content on YouTube.",
            wage: 80000,
        },
        {
            jobId: "12",
            name: "Model",
            description: "Poses for photoshoots or walks on runways.",
            wage: 35000,
        },
        {
            jobId: "13",
            name: "Doctor",
            description: "Diagnoses and treats medical conditions.",
            wage: 90000,
        },
        {
            jobId: "14",
            name: "Artist",
            description: "Creates visual or performing arts.",
            wage: 45000,
        },
        {
            jobId: "15",
            name: "Chef",
            description: "Prepares and cooks food in restaurants.",
            wage: 35000,
        },
        {
            jobId: "16",
            name: "Pilot",
            description: "Flies aircraft to transport passengers or cargo.",
            wage: 85000,
        },
        {
            jobId: "17",
            name: "Plumber",
            description: "Installs and repairs plumbing systems.",
            wage: 40000,
        },
    ];


    for (const jobInfo of jobsData) {
        try {
            // Check if the job already exists
            const existingJobs = await Jobs.findOne({
                where: {
                    userId: jobInfo.userId,
                    guildId: jobInfo.guildId
                },
            });

            if (existingJobs) {
                // Job already exists, update its data
                await existingJobs.update(jobInfo);
            } else {
                // Job doesn't exist, create a new record
                await Jobs.create(jobInfo);
            }
        } catch (error) {
            console.error(`Error creating/updating guild: ${error.message}`);
        }
    }

}