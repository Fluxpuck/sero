const { Moderator } = require("../../database/models");
const { generateUniqueHash } = require('../../utils/FunctionManager');

module.exports.run = async () => {

    const moderatorData = [
        {
            userId: "270640827787771943",
            guildId: "660103319557111808",
            location: "Netherlands",
            language: "Dutch, English, German",
            rank: "Administrator"
        },
        {
            userId: "270640827787771943",
            guildId: "738358458826489896",
            location: "Netherlands",
            language: "Dutch, English, German",
            rank: "Moderator"
        },
        {
            userId: "1042558234566860810",
            guildId: "660103319557111808",
            location: "United Kingdom",
            language: "English",
            rank: "Moderator"
        },
    ]

    const updatedModeratorData = moderatorData.map((moderator) => ({
        ...moderator,
        userKey: generateUniqueHash(moderator.userId, moderator.guildId),
    }));

    for (const moderatorInfo of updatedModeratorData) {
        try {

            await Moderator.create(moderatorInfo);

        } catch (error) {
            console.error(`Error creating/updating moderator: ${error.message}`);
        }
    }

}