const { Guild } = require("../../database/models");

module.exports.run = async () => {

    const guildData = [
        {
            guildId: "660103319557111808",
            guildName: "Fluxpuck's Secret Society"
        },
        {
            guildId: "552953312073220096",
            guildName: "SSundee",
            active: false
        },
        {
            guildId: "253740950315204608",
            guildName: "Cali's Fam",
            active: false
        },
    ]

    for (const guildInfo of guildData) {
        try {
            // Check if the guild already exists
            const existingGuild = await Guild.findOne({
                where: { guildId: guildInfo.guildId },
            });

            if (existingGuild) {
                // Guild already exists, update its data
                await existingGuild.update(guildInfo);
            } else {
                // Guild doesn't exist, create a new record
                await Guild.create(guildInfo);
            }
        } catch (error) {
            console.error(`Error creating/updating guild: ${error.message}`);
        }
    }

}