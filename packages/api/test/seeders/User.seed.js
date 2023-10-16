const { User, Guild } = require("../../database/models");

module.exports.run = async () => {

    const userData = [
        {
            userId: "270640827787771943",
            userName: "fluxpuck",
            guildId: "660103319557111808"
        },
        {
            userId: "270640827787771943",
            userName: "fluxpuck",
            guildId: "738358458826489896"
        },
        {
            userId: "270640827787771943",
            userName: "fluxpuck",
            active: false,
            guildId: "253740950315204608"
        },
        {
            userId: "1042558234566860810",
            userName: "jacksonnnnnnnnn",
            guildId: "660103319557111808"
        },
        {
            userId: "377842014290575361",
            userName: "zakariax",
            guildId: "660103319557111808"
        },
        {
            userId: "562233152827817984",
            userName: "thefallenshade",
            active: false,
            guildId: "660103319557111808"
        },
    ]

    for (const userInfo of userData) {
        try {
            // Check if the guild with the specified guildId exists
            const existingGuild = await Guild.findOne({
                where: {
                    guildId: userInfo.guildId,
                },
            });

            if (existingGuild) {
                // Guild exists, proceed to create or update the user
                const existingUser = await User.findOne({
                    where: {
                        userId: userInfo.userId,
                        guildId: userInfo.guildId,
                    },
                });

                if (existingUser) {
                    // User already exists, update its data
                    await existingUser.update(userInfo);
                } else {
                    // User doesn't exist, create a new record
                    await User.create(userInfo);
                }
            }
        } catch (error) {
            console.error(`Error creating/updating user: ${error.message}`);
        }
    }

}