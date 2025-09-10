const { getRequest, postRequest } = require("../database/connection");
const { calculateAge } = require("../lib/helpers/TimeDateHelpers/timeHelper");
const { findUser } = require("../lib/resolvers/userResolver");

const {
    BIRTHDAY_MESSAGES,
    BIRTHDAY_MESSAGES_AGE,
} = require("../assets/birthday-messages");

const BIRTHDAY_DURATION = 24; // 24 hours

module.exports = async (client, payload) => {

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

        // Get the birthday role for the guild
        const role = await guild.roles.fetch(payload.roleId);

        // Get the birthdays for today for the guild
        const guildBirthdayData = await getRequest(`/guilds/${payload.guildId}/birthday`);
        if (guildBirthdayData.status !== 200) return;

        const birthdayData = guildBirthdayData?.data;
        if (!birthdayData) return;

        // For each birthday get a random message and send a message in the ${channel}
        for (const birthday of birthdayData) {
            const { year, month, day } = birthday;

            // Find the user in the guild
            const member = findUser(guild, birthday.userId) || await guild.members.fetch(birthday.userId);
            if (member) {

                // Check if the user has set an age
                const memberAge = year ? calculateAge({ year, month, day }) : null;

                // Set a random birthday message
                // based on if someone has set their age (>=13)
                let birthdayMessage = "";
                if (memberAge >= 13) {
                    let idy = Math.floor(Math.random() * BIRTHDAY_MESSAGES_AGE.length);
                    birthdayMessage = BIRTHDAY_MESSAGES_AGE[idy].replace('{NAME}', `<@${member.id}>`).replace('{AGE}', memberAge);
                } else {
                    let idx = Math.floor(Math.random() * BIRTHDAY_MESSAGES.length);
                    birthdayMessage = BIRTHDAY_MESSAGES[idx].replace('{NAME}', `<@${member.id}>`)
                }

                // Send the birthday message in the channel
                const sentMessage = await channel.send({
                    content: birthdayMessage,

                });

                // Add reaction to the message
                await sentMessage.react("🎉");

                if (role) {
                    // Add the role to the user
                    await member.roles.add(role);
                    // Store the temporary role in the database
                    await postRequest(`/guilds/${payload.guildId}/roles/add`, { userId: birthday.userId, roleId: role.id, duration: BIRTHDAY_DURATION });
                }
            }
        }
    } catch (err) { }
};
