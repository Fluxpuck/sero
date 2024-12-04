const { postRequest } = require("../../database/connection");
const { getYear } = require('date-fns');
const { getBirthdate } = require("../../lib/helpers/TimeDateHelpers/timeHelper");
const { deferInteraction, replyInteraction, followUpInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "birthday",
    description: "Set your birthday and allowing the bot to wish you on your special day.",
    usage: "/birthday [month] [day] (year)",
    interaction: {
        type: 1,
        options: [
            {
                name: "day",
                description: "The day of your birthday",
                type: 10,
                required: true,
                minValue: 1,
                maxValue: 31,
            },
            {
                name: "month",
                description: "The month of your birthday (number)",
                type: 10,
                required: true,
                minValue: 1,
                maxValue: 12,
            },
            {
                name: "year",
                description: "The year of your birthday. This will be used to calculate your age!",
                type: 10,
                required: false,
                minValue: 1980,
                maxValue: getYear(new Date()) // Current year
            },
        ],
    },
    defaultMemberPermissions: ["SendMessages"],
    cooldown: 2 * 60, // 2 minutes
};

module.exports.run = async (client, interaction) => {
    // Defer the reply to prevent timeout while processing
    await deferInteraction(interaction, true);

    // Get Birthday values from the interaction options
    const dayValue = interaction.options.get("day").value;
    const monthValue = interaction.options.get("month").value;
    const yearValue = interaction.options.get("year")?.value || null;

    // Set the birthday in the database
    const setBirthdayResponse = await postRequest(`/guilds/${interaction.guildId}/birthday`, {
        userId: interaction.user.id,
        day: dayValue,
        month: monthValue,
        year: yearValue
    });

    if (setBirthdayResponse.status === 403) {
        return followUpInteraction(interaction, {
            content: "Oops! You have already set your birthday twice and cannot set it again.",
            ephemeral: true
        });
    }

    const birthDate = getBirthdate(dayValue, monthValue);

    if (setBirthdayResponse.status === 200) {
        return replyInteraction(interaction, {
            content: `Your birthday has been updated to **${birthDate.date}** 🎉 \n-# The bot will now wish you on your special day!`,
            ephemeral: true
        });
    }

    if (setBirthdayResponse.status === 201) {
        return replyInteraction(interaction, {
            content: `Your birthday has been successfully set to **${birthDate.date}** 🎉 \n-# The bot will now wish you on your special day!`,
            ephemeral: true
        });
    }

    return followUpInteraction(interaction, {
        content: "Something went wrong while setting your birthday. Please try again later.",
        ephemeral: true
    });
};
