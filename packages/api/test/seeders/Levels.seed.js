const { User, Guild, Levels } = require("../../database/models");

module.exports.run = async () => {

    const userData = [
        {   // FLUXPUCK
            userId: "270640827787771943",
            guildId: "660103319557111808",
            userKey: "1236681046",
            experience: 6543
        },
        {   // FLUXPUCK, GUILD 2
            userId: "738358458826489896",
            guildId: "660103319557111808",
            userKey: "1422411162"
        },
        {   // ZAKARIA, GUILD 1
            userId: "377842014290575361",
            guildId: "660103319557111808",
            userKey: "561291069",
            experience: 238
        }
    ]

    for (const userInfo of userData) {
        try {
            // Check if the corresponding user exists in the User table
            const existingUser = await User.findOne({
                where: { userKey: userInfo.userKey },
            });

            if (existingUser) {
                // User exists, proceed to create or update the level
                const existingLevel = await Levels.findOne({
                    where: { userKey: userInfo.userKey },
                });

                if (existingLevel) {
                    // Level already exists, update its data
                    await existingLevel.update(userInfo);
                } else {
                    // Level doesn't exist, create a new record
                    await Levels.create(userInfo);
                }
            } else {
                console.log(`User with userKey ${userInfo.userKey} does not exist.`);
            }
        } catch (error) {
            console.error(`Error creating/updating levels for ${userInfo.userKey}: ${error.message}`);
        }
    }


}