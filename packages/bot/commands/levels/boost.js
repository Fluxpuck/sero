const { postRequest, getRequest } = require("../../database/connection");
const moment = require('moment');

module.exports.props = {
    commandName: "boost",
    description: "Set the experience modifier for members in the guild",
    usage: "/boost [modifier] [duration]",
    interaction: {
        type: 1,
        options: [
            {
                name: "modifier",
                type: 10,
                description: "The amount to multiply the experience by",
                required: false,
                minValue: 0.5,
                maxValue: 5,
            },
            {
                name: "duration",
                type: 10,
                description: "The duration of the boost in hours",
                required: false,
                minValue: 1,
                maxValue: 120,
            },
        ],
    },
    defaultMemberPermissions: ['ManageGuild'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    // Get modifier && duration details from the interaction options
    const targetModifier = interaction.options.get("modifier")?.value;
    const targetDuration = interaction.options.get("duration")?.value;

    if (!targetModifier && !targetDuration) {

        /**
         * If no options are provided, we should show the current modifier and duration
         */
        const result = await getRequest(`/guilds/${interaction.guildId}`);
        // If the request was not successful, return an error
        if (result?.status === 200) {

            // Get the modifier and duration from the response
            const modifier = result.data.modifier;
            const duration = result.data.duration || 0;
            const expireAt = result.data.expireAt;

            const now = moment();
            const expireMoment = moment(expireAt);

            if (!expireAt || now.isAfter(expireMoment)) {
                return interaction.editReply({
                    content: `The current server-modifier is **${modifier}X**.`,
                    ephemeral: false
                });
            } else {
                const diff = expireMoment.diff(now);

                const durationHours = Math.floor(diff / 3_600_000); // convert milliseconds to hours
                const durationMinutes = Math.floor((diff % 3_600_000) / 60_000); // convert remaining milliseconds to minutes

                const timeLeft = `${durationHours} hour${durationHours === 1 ? "" : "s"} and ${durationMinutes} minute${durationMinutes === 1 ? "" : "s"}`;

                return interaction.editReply({
                    content: `Currently boosting the server **${modifier}X** for **${duration} hour${duration === 1 ? "" : "s"}**.\n-# There are ${timeLeft} left.`,
                    ephemeral: false
                });
            }

        } else {
            await interaction.deleteReply();
            return interaction.followUp({
                content: `Uh oh! Something went wrong fetching the server modifier.`,
                ephemeral: true
            })
        }

    } else {

        /**
         * If options are provided, we should set the modifier and duration
         */

        //set duration based on interaction options
        const duration = targetDuration ?? 1;

        // Give the user the experience
        const result = await postRequest(`/guilds/boost`, { guildId: interaction.guildId, modifier: targetModifier, duration: duration });

        // If the request was not successful, return an error
        if (result?.status !== 201) {
            await interaction.deleteReply();
            return interaction.followUp({
                content: `Uh oh! Something went wrong and the modifier has not been set.`,
                ephemeral: true
            })
        } else {
            return interaction.editReply({
                content: `Boosting the server **${targetModifier}X** for **${duration} hour${duration === 1 ? "" : "s"}**!`,
                ephemeral: false
            })
        }
    }
}