const { GuildSettings } = require("../../database/models");

module.exports.run = async () => {

    const guildSettingsData = [
        {
            guildId: "660103319557111808",
            channelId: "660104519031717896",
            type: "vc-logs"
        },
        {
            guildId: "660103319557111808",
            channelId: "1087368064200343592",
            type: "member-logs"
        },
        {
            guildId: "660103319557111808",
            channelId: "1181313001232543804",
            type: "exp-reward-drop"
        },
    ]

    try {
        await GuildSettings.bulkCreate(guildSettingsData);
        console.log("\x1b[34m", ` → Bulk created ${guildSettingsData.length} guildSettings`);
    } catch (error) {
        console.error(`Error bulk creating levels: ${error.message}`);
    }
}