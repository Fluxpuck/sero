const { ActionRowBuilder } = require("discord.js");
const ClientEmbedColors = require("../assets/embed-colors");
const ClientButtonsEnum = require("../assets/embed-buttons");
const { createCustomEmbed } = require("../assets/embed");
const { REWARD_MESSAGES, REWARD_GIFS } = require("../assets/reward-messages");

const { getUniqueAuthorsFromMessages } = require("../lib/resolvers/messageResolver");

module.exports = async (client, payload) => {

    // Check if all required attributes exist in the payload
    const requiredAttributes = ['guildId', 'channelId', 'token'];
    for (const attribute of requiredAttributes) {
        if (!payload.hasOwnProperty(attribute)) return;
    }

    try {
        // Get the guild by guildId and the member by userId
        const guild = await client.guilds.fetch(payload.guildId);
        const channel = await guild.channels.fetch(payload.channelId);

        // Fetch the last 100 messages in the channel
        const eligibleIds = await getUniqueAuthorsFromMessages(channel, 10);
        if (eligibleIds.length === 0) return;

        // Set the rewardDrop object in the guild
        guild.rewardDrop = { token: payload.token, claimed: false, eligibleCollection: eligibleIds };

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

        setTimeout(async () => {
            try { // Check if the message is still available
                const fetchedMessage = await sentMessage.fetch();
                if (fetchedMessage.deletable) await fetchedMessage.delete();
            } catch (err) { }
        }, 15_000); // 15_000 milliseconds = 15 seconds

        if (process.env.NODE_ENV === "development") {
            console.log("\x1b[95m", "XP Reward dropped at:", new Date().toLocaleTimeString());
        }

    } catch (err) { };
}