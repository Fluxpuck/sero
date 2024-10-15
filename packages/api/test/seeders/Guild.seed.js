const { Guild } = require("../../database/models");

module.exports.run = async () => {

    const guildData = [
        {
            guildId: "660103319557111808",
            guildName: "Fluxpuck's Secret Society",
            active: true
        },
        {
            guildId: "552953312073220096",
            guildName: "SSundee",
        },
        {
            guildId: "253740950315204608",
            guildName: "Cali's Fam",
        },
    ]

    for (const guildInfo of guildData) {
        try {
            await Guild.upsert(guildInfo, { where: { guildId: guildInfo.guildId } });
            console.log("\x1b[34m", ` → Created guild: ${guildInfo.guildName}`);
        } catch (error) {
            console.error(`Error upserting guild: ${error.message}`);
        }
    }

}