const { User, UserLevels } = require("../../database/models");

module.exports.run = async () => {

    const userData = [
        {   // FLUXPUCK
            userId: "270640827787771943",
            guildId: "660103319557111808",
            experience: 2458,
            level: 2,
            currentLevelExp: 1000,
            nextLevelExp: 3000,
            remainingExp: 542,
        },
        {   // FLUXPUCK, GUILD 2
            userId: "270640827787771943",
            guildId: "253740950315204608",
            experience: 27_489,
            level: 8,
            currentLevelExp: 21_000,
            nextLevelExp: 28_000,
            remainingExp: 511,
        },
        {   // ZAKARIA, GUILD 1
            userId: "377842014290575361",
            guildId: "660103319557111808",
            experience: 238,
            level: 1,
            currentLevelExp: 0,
            nextLevelExp: 1000,
            remainingExp: 762,
        },
        {   // ZEUSGMJ, GUILD 1
            userId: "438054607571386378",
            guildId: "660103319557111808",
            experience: 6969,
            level: 4,
            currentLevelExp: 6000,
            nextLevelExp: 10_000,
            remainingExp: 3031,
        }
    ]

    try {
        for (const userDataItem of userData) {
            // Check if the user already exists
            const existingUser = await User.findOne({
                where: { userId: userDataItem.userId, guildId: userDataItem.guildId }
            });

            if (!existingUser) {
                console.error(`User (${userDataItem.userId}) does not exist in guild (${userDataItem.guildId})`);
            }

            if (userDataItem.experience !== undefined) {
                await UserLevels.upsert({
                    userId: userDataItem.userId,
                    guildId: userDataItem.guildId,
                    experience: userDataItem.experience,
                    level: userDataItem.level,
                    currentLevelExp: userDataItem.currentLevelExp,
                    nextLevelExp: userDataItem.nextLevelExp,
                    remainingExp: userDataItem.remainingExp
                }, {
                    where: { userId: userDataItem.userId, guildId: userDataItem.guildId },
                    hooks: true // Add hooks option to trigger lifecycle hooks
                });
                console.log("\x1b[34m", ` → Added level for ${userDataItem.userId} | ${userDataItem.guildId}`);

            }
        }
    } catch (error) {
        console.error(`Error adding levels: ${error.message}`);
    }
}