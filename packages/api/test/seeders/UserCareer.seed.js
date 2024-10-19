const { UserCareers } = require("../../database/models");

module.exports.run = async () => {
    const userData = [
        {
            userId: "1042558234566860810",
            jobId: 8,
            guildId: "660103319557111808",
            level: 69
        },
        {
            userId: "377842014290575361", // ZAKARIAX
            jobId: 3,
            guildId: "660103319557111808",
            level: 30
        },
        {
            userId: "438054607571386378", // ZEUSGMJ
            jobId: 7,
            guildId: "660103319557111808",
            level: 25
        },
        {
            userId: "562233152827817984", // THEFALLENSHADE
            jobId: 1,
            guildId: "660103319557111808",
            level: 20
        },
        {
            userId: "113809103071399344",
            jobId: 9,
            guildId: "660103319557111808",
            level: 15
        }
    ];

    for (const userInfo of userData) {
        try {
            await UserCareers.upsert(userInfo);
        } catch (error) {
            console.error(`Error upserting job: ${error.message}`);
        }
    }
}