const { User, UserLevels } = require("../../database/models");

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

    try {
        for (const userDataItem of userData) {
            // Check if the user already exists
            const existingUser = await User.findOne({
                where: { userId: userDataItem.userId, guildId: userDataItem.guildId }
            });

            if (!existingUser) {
                console.error(`User with ID ${userDataItem.userId} does not exist in guild ${userDataItem.guildId}`);
            }

            if (userDataItem.experience !== undefined) {
                await UserLevels.upsert({
                    userId: userDataItem.userId,
                    guildId: userDataItem.guildId,
                    experience: userDataItem.experience
                }, { where: { userId: userDataItem.userId, guildId: userDataItem.guildId } });
                console.log("\x1b[34m", ` → Added level for ${userDataItem.userId} | ${userDataItem.guildId}`);
            }
        }
    } catch (error) {
        console.error(`Error adding levels: ${error.message}`);
    }


}