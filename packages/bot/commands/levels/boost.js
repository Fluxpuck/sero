const { postRequest } = require("../../database/connection");

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
                required: true,
                minValue: 0.5,
                maxValue: 5,
            },
            {
                name: "duration",
                type: 10,
                description: "The duration of the boost in hours",
                required: false,
                minValue: 1,
                maxValue: 168,
            },
        ],
    },
    defaultMemberPermissions: ['KickMembers'],
}

module.exports.run = async (client, interaction) => {
    // Get modifier && duration details from the interaction options
    const targetModifier = interaction.options.get("modifier").value;
    const targetDuration = interaction.options.get("duration")?.value;

    //set duration based on interaction options
    const duration = targetDuration ?? 1;

    // Give the user the experience
    const result = await postRequest(`/guilds/boost/${interaction.guildId}`, { modifier: targetModifier, duration: duration });

    // If the request was not successful, return an error
    if (result.status !== 200) {
        return interaction.reply({
            content: `Uh oh! Something went wrong and the modifier has not been set.`,
            ephemeral: true
        })
    } else {
        return interaction.reply({
            content: `Boosting the experience with **${targetModifier}X** for **${duration} hour${duration === 1 ? "" : "s"}**!`,
            ephemeral: false
        })
    }
}