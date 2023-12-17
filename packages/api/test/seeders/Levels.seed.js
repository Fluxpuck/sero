const { User, Guild, Levels } = require("../../database/models");

module.exports.run = async () => {

    const userData = [
        {   // FLUXPUCK
            userId: "270640827787771943",
            guildId: "660103319557111808",
            experience: 6543
        },
        {   // FLUXPUCK, GUILD 2
            userId: "738358458826489896",
            guildId: "660103319557111808",
        },
        {   // ZAKARIA, GUILD 1
            userId: "377842014290575361",
            guildId: "660103319557111808",
            experience: 238
        }
    ]

    for (const userInfo of userData) {
        try {
            // Check if the corresponding user exists in the User table
            const existingUser = await User.findOne({
                where: { userHash: userInfo.userHash },
            });

            if (existingUser) {
                // User exists, proceed to create or update the level
                const existingLevel = await Levels.findOne({
                    where: { userHash: userInfo.userHash },
                });

                if (existingLevel) {
                    // Level already exists, update its data
                    await existingLevel.update(userInfo);
                } else {
                    // Level doesn't exist, create a new record
                    await Levels.create(userInfo);
                }
            } else {
                console.log(`User with userHash ${userInfo.userHash} does not exist.`);
            }
        } catch (error) {
            console.error(`Error creating/updating levels for ${userInfo.userHash}: ${error.message}`);
        }
    }


}