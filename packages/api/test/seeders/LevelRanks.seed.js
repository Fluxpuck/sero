const { LevelRanks } = require("../../database/models");

module.exports.run = async () => {

    const levelRankData = [
        {
            level: 1,
            guildId: "660103319557111808",
            reward: "875754231699750923"
        },
        {
            level: 5,
            guildId: "660103319557111808",
            reward: "875754231699750923"
        },
        {
            level: 10,
            guildId: "660103319557111808",
            reward: "875754231699750923"
        },
        {
            level: 20,
            guildId: "660103319557111808",
            reward: "875754231699750923"
        },
    ]

    for (const levelRankInfo of levelRankData) {
        try {
            await LevelRanks.create(levelRankInfo);
            console.log("\x1b[34m", ` → Created level rank for level ${levelRankInfo.level} | ${levelRankInfo.guildId}`);
        } catch (error) {
            console.error(`Error creating level rank: ${error.message}`);
        }
    }

}