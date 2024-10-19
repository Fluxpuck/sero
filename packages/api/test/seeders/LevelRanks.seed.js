const { LevelRanks } = require("../../database/models");

module.exports.run = async () => {

    const levelRankData = [
        {
            level: 1,
            guildId: "660103319557111808",
            roleId: "1243525019380875284"
        },
        {
            level: 5,
            guildId: "660103319557111808",
            roleId: "1243525174217670656"
        },
        {
            level: 10,
            guildId: "660103319557111808",
            roleId: "1243525189908566076"
        },
    ]

    for (const levelRankInfo of levelRankData) {
        try {
            await LevelRanks.upsert(levelRankInfo);
            console.log("\x1b[34m", ` → Created level rank for level ${levelRankInfo.level} | ${levelRankInfo.guildId}`);
        } catch (error) {
            console.error(`Error creating level rank: ${error.message}`);
        }
    }

}