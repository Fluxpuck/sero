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
            userId: "438054607571386378",
            userName: "zeusgmj",
            guildId: "660103319557111808"
        },
        {
            userId: "562233152827817984",
            userName: "thefallenshade",
            active: false,
            guildId: "660103319557111808"
        },
        {
            userId: "1138091030713995344",
            guildId: "660103319557111808",
            userName: "seven",
        }
    ]

    for (const userInfo of userData) {
        try {
            const existingGuild = await Guild.findOne({
                where: { guildId: userInfo.guildId },
            });

            if (existingGuild) {
                await User.upsert(userInfo, {
                    where: {
                        userId: userInfo.userId,
                        guildId: userInfo.guildId,
                    },
                });
                console.log("\x1b[34m", ` → Created user: ${userInfo.userName} | ${userInfo.guildId}`);
            }
        } catch (error) {
            console.error(`Error creating user: ${error.message}`);
        }
    }

}