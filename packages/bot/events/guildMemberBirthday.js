const ClientEmbedColors = require("../assets/embed-colors");
const { createCustomEmbed } = require("../assets/embed");
const { getRequest } = require("../database/connection");
const { getYearsAgo } = require("../lib/helpers/TimeDateHelpers/timeHelper");

const {
    BIRTHDAY_MESSAGES,
    BIRTHDAY_MESSAGES_AGE,
} = require("../assets/birthday-messages");

module.exports = async (client, payload) => {

    console.log("guildMemberBirthday", payload);

    // Check if all required attributes exist in the payload
    const requiredAttributes = ["guildId", "channelId"];
    for (const attribute of requiredAttributes) {
        if (!payload.hasOwnProperty(attribute)) return;
    }

    try {
        // Get the guild by guildId and the member by userId
        const guild = await client.guilds.fetch(payload.guildId);
        const channel = await guild.channels.fetch(payload.channelId);
        if (!channel) return;

        // Get all the birthdays for current guild GET api/guilds/:guildId/birthday
        const result = await getRequest(`/guilds/${payload.guildId}/birthday`);
        const birthdays = result?.data;

        if (!birthdays || birthdays.status === 404) return;

        // For each birthday get a random message and send a message in the ${channel}
        birthdays.forEach(async (birthday) => {
            const { userId, birthdayAt } = birthday;

            // Check if the user has set an age (age above 12)
            const age = getYearsAgo(birthdayAt);

            // Get a random message based on if someone has set their age from Birthday_Messages_Age or from Birthday_Message if no age
            // Also add the name to the message and age for if the age was set
            if (age >= 12) {
                let message =
                    BIRTHDAY_MESSAGES_AGE[
                    Math.floor(Math.random() * BIRTHDAY_MESSAGES_AGE.length)
                    ];
                message = message.replace("{name}", `<@${userId}>`);
                message = message.replace("{age}", age);
            } else {
                let message =
                    BIRTHDAY_MESSAGES[
                    Math.floor(Math.random() * BIRTHDAY_MESSAGES.length)
                    ];
                message = message.replace("{name}", `<@${userId}>`);
            }

            // Create an embed to display the user's balance
            const messageEmbed = createCustomEmbed({
                description: message,
                color: ClientEmbedColors.GREEN,
            });

            // For future claiming birthday exp [OPTIONAL]
            // const messageComponents = new ActionRowBuilder().addComponents(
            //     ClientButtonsEnum.CLAIM_BIRTHDAY_GIFT
            // );

            const sentMessage = await channel.send({
                embeds: [messageEmbed],
                components: [], //[messageComponents]
                ephemeral: false,
            });

            // Add reaction to the message
            await sentMessage.react("🎉"); // Standard emoji, could be nice to add custom emoji ID's to database settings [OPTIONAL]
        });
    } catch (err) { }
};
