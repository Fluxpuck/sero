const { ActionRowBuilder, ComponentType } = require("discord.js");
const ClientEmbedColors = require("../assets/embed-colors");
const ClientButtonsEnum = require("../assets/embed-buttons");
const { createCustomEmbed } = require("../assets/embed");
const { REWARD_MESSAGES, REWARD_GIFS } = require("../assets/reward-messages");

module.exports = async (client, payload) => {

    // Check if all required attributes exist in the payload
    const requiredAttributes = ['guildId', 'channelId'];
    for (const attribute of requiredAttributes) {
        if (!payload.hasOwnProperty(attribute)) return;
    }

    try {
        // Get the guild by guildId and the member by userId
        const guild = await client.guilds.fetch(payload.guildId);
        const channel = await guild.channels.fetch(payload.channelId);

        // Get random job message, based on the jobId
        let text_idx = Math.floor(Math.random() * REWARD_MESSAGES.length);
        let url_idx = Math.floor(Math.random() * REWARD_GIFS.length);

        // Create an embed to display the user's balance
        const messageEmbed = createCustomEmbed({
            title: `🎁 Random Reward Drop! 🎁`,
            description: `${REWARD_MESSAGES[text_idx]}\nQuick, claim it before someone else does!`,
            image: REWARD_GIFS[url_idx],
            color: ClientEmbedColors.YELLOW,
        })

        const messageComponents = new ActionRowBuilder()
            .addComponents(
                ClientButtonsEnum.CLAIM_EXP_DROP
            );

        const sentMessage = await channel.send({
            embeds: [messageEmbed],
            components: [messageComponents],
            ephemeral: false
        });

        // Delete the message after 10 seconds
        setTimeout(async () => {
            try { // Check if the message is still available
                const fetchedMessage = await sentMessage.fetch();
                if (fetchedMessage.deletable) await fetchedMessage.delete();
            } catch (err) { }
        }, 20_000); // 20_000 milliseconds = 20 seconds

        if (process.env.NODE_ENV === "development") {
            console.log("\x1b[95m", "XP Reward dropped at:", new Date().toLocaleTimeString());
        }

    } catch (err) {
        console.error(err);
    };
}