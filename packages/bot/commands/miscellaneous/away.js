const { postRequest } = require("../../database/connection");

module.exports.props = {
    commandName: "away",
    description: "Let everyone know you're away",
    usage: "/away [time]",
    interaction: {
        type: 1,
        options: [
            {
                name: "time",
                type: 10,
                description: "The amount (in minutes) of time you want to be away for",
                required: false,
                minValue: 5,
                maxValue: 720,
            },
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    // Get Away time value from the interaction options
    const timeOption = interaction.options.get("time")?.value;
    const timeInMinutes = timeOption ?? 5; // Default to 5 minutes

    // Give the user the experience
    const result = await postRequest(`/away/${interaction.guildId}/${interaction.user.id}`, { duration: timeInMinutes });

    // If the request was not successful, return an error
    if (result.status !== 200) {
        return interaction.reply({
            content: "Something went wrong while setting your away status.",
            ephemeral: true
        })
    } else {
        return interaction.reply({
            content: `<@${interaction.user.id}> will be away for **${timeInMinutes}** minutes!`,
            ephemeral: false
        }).then(msg => {
            setTimeout(() => {
                msg.delete();
            }, 8000); // 8 seconds
        });

    }

}