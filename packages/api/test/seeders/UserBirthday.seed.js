const { UserBirthday } = require("../../database/models");

module.exports.run = async () => {

    const bulkData = [
        {
            userId: "377842014290575361",
            guildId: "660103319557111808",
            birthdayAt: "2024-10-19 00:00:00"
        },
        {
            userId: "270640827787771943",
            guildId: "660103319557111808",
            birthdayAt: "2024-11-19 00:00:00"
        },
    ]

    for (const birthdayData of bulkData) {
        try {
            await UserBirthday.upsert(birthdayData);
            console.log("\x1b[34m", ` → Created birthday for ${birthdayData.userId} | ${birthdayData.guildId}`);
        } catch (error) {
            console.error(`Error creating birthday: ${error.message}`);
        }
    }

}