const { createCustomEmbed } = require("../../assets/embed");
const { getRequest } = require('../../database/connection');
const { unixTimestamp } = require("../../lib/helpers/TimeDateHelpers/timeHelper");

module.exports.props = {
    commandName: "career",
    description: "Get information on the career of a user.",
    usage: "/career [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to get their career info of",
                required: false
            }
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    // Get User details from the interaction options
    const targetUser = interaction.options.getUser("user")?.user || interaction.user;

    // Get the user's career && career snapshots
    const userCareer = await getRequest(`/career/${interaction.guildId}/${targetUser.id}`);
    const careerIncome = await getRequest(`/career/income/${interaction.guildId}/${targetUser.id}`)

    // If the (required) request was not successful, return an error
    if (userCareer.status !== 200) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: `Uh oh! The user ${targetUser.username} has no career yet.`,
            ephemeral: true
        })
    }

    // Set the data from the requests
    const { level, updatedAt } = userCareer.data;
    const { name } = userCareer.data.job;
    const totalIncome = careerIncome.data.careerIncome || 0;
    const startCareerDate = new Date(updatedAt);

    // Create an embed to display the user's career
    const messageEmbed = createCustomEmbed({
        thumbnail: targetUser.displayAvatarURL({ dynamic: false }),
        title: `${targetUser.username}'s Career Info`,
        fields: [
            {
                name: `Job Name`,
                value: `${name.toString()}`,
                inline: true
            },
            {
                name: `Time in Job`,
                value: `Since <t:${unixTimestamp(startCareerDate)}:d> (<t:${unixTimestamp(startCareerDate)}:R>)`,
                inline: true
            },
            {
                name: "\t", // Add a blank field
                value: "\t"
            },
            {
                name: `Total Income`,
                value: `${totalIncome.toLocaleString() ?? `N/A`} coins`,
                inline: true
            },
            {
                name: `Career Level`,
                value: `Level ${level.toLocaleString()}`,
                inline: true
            }
        ]
    })

    // Reply with the messageEmbed
    return interaction.editReply({
        embeds: [messageEmbed],
        ephemeral: false
    })
}