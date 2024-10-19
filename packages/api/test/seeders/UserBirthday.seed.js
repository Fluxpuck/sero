const { UserBirthday } = require("../../database/models");

module.exports.run = async () => {

    const today = new Date();
    const todayMonth = today.getMonth() + 1; // Months are zero-based in JavaScript
    const todayDay = today.getDate();

    const bulkData = [
        {
            userId: "377842014290575361",
            guildId: "660103319557111808",
            year: 2007,
            month: todayMonth,
            day: todayDay
        },
        {
            userId: "270640827787771943",
            guildId: "660103319557111808",
            month: todayMonth,
            day: todayDay
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