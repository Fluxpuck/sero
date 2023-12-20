const { User, Guild, Levels } = require("../../database/models");

module.exports.run = async () => {

    const userData = [
        {   // FLUXPUCK
            userId: "270640827787771943",
            guildId: "660103319557111808",
            experience: 2458
        },
        {   // FLUXPUCK, GUILD 2
            userId: "270640827787771943",
            guildId: "253740950315204608",
        },
        {   // ZAKARIA, GUILD 1
            userId: "377842014290575361",
            guildId: "660103319557111808",
            experience: 238
        },
        {   // ZEUSGMJ, GUILD 1
            userId: "438054607571386378",
            guildId: "660103319557111808",
            experience: 6969
        }
    ]

    for (const userInfo of userData) {
        try {
            // Check if the corresponding user exists in the User table
            const existingUser = await User.findOne({
                where: {
                    userId: userInfo.userId,
                    guildId: userInfo.guildId
                },
            });

            if (existingUser) {
                // User exists, proceed to create or update the level
                const existingLevel = await Levels.findOne({
                    where: {
                        userId: userInfo.userId,
                        guildId: userInfo.guildId
                    },
                });

                if (existingLevel) {
                    // Level already exists, update its data
                    await existingLevel.update(userInfo);
                } else {
                    // Level doesn't exist, create a new record
                    await Levels.create(userInfo);
                }
            } else {
                console.log(`User with does not exist in the User table: ${userInfo.guildId}/${userInfo.userId}`);
            }
        } catch (error) {
            console.error(`Error creating/updating levels for ${userInfo.guildId}/${userInfo.userId}: ${error.message}`);
        }
    }


}