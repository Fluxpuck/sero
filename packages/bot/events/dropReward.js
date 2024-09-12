const { createCustomEmbed } = require("../assets/embed");

module.exports = async (client, payload) => {

    console.log("Drop Reward Event", payload);

    // Check if all required attributes exist in the payload
    const requiredAttributes = ['guildId', 'channelId', 'type'];
    for (const attribute of requiredAttributes) {
        if (!payload.hasOwnProperty(attribute)) return;
    }

    console.log("check 1")

    // Double check the payload type
    if (payload.type !== 'exp-reward-drops') return;

    console.log("check 2")

    try {
        // Get the guild by guildId and the member by userId
        const guild = await client.guilds.fetch(payload.guildId);
        const channel = await guild.channels.fetch(payload.channelId);

        console.log(guild.id, channel.id)

        // Create an embed to display the user's balance
        const messageEmbed = createCustomEmbed({
            title: `title`,
            description: `description`
        })

        channel.send({
            content: "XP Reward Dropped",
            // embeds: [messageEmbed],
            ephemeral: false
        });

        if (process.env.NODE_ENV === "development") {
            console.log("\x1b[95m", "XP Reward dropped at:", new Date().toLocaleTimeString());
        }

    } catch (err) {
        console.error(err);
    };
}