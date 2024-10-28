const { GuildSettings } = require("../../database/models");

module.exports.run = async () => {

    const guildSettingsData = [
        {
            guildId: "660103319557111808",
            targetId: "660104519031717896",
            type: "vc-logs"
        },
        {
            guildId: "660103319557111808",
            targetId: "660104519031717896",
            type: "member-logs"
        },
        {
            guildId: "660103319557111808",
            targetId: "660104519031717896",
            type: "exp-reward-drops"
        },
        {
            guildId: "660103319557111808",
            targetId: "660104519031717896",
            type: "birthday-messages"
        },
    ]

    try {
        await GuildSettings.bulkCreate(guildSettingsData);
        console.log("\x1b[34m", ` → Bulk created ${guildSettingsData.length} guildSettings`);
    } catch (error) {
        console.error(`Error bulk creating levels: ${error.message}`);
    }
}