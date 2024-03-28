const { createCustomEmbed } = require("../../assets/embed");
const { getRequest } = require('../../database/connection')

module.exports.props = {
    commandName: "career",
    description: "Get information on the balance and career of a user.",
    usage: "/career [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to get information from.",
                required: false
            }
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    // => Fetch the user and get all required information from the database.
    const targetUser = interaction.options.getUser("user")?.user || interaction.user;
    const result = await getRequest(`/career/${interaction.guildId}/${targetUser.id}`)
    const getBalance = await getRequest(`/balance/${interaction.guildId}/${targetUser.id}`)
    const getSnapshot = await getRequest(`/career/snap/${interaction.guildId}/${targetUser.id}`)

    const { balance } = getBalance.data;
    const { jobId, job, level } = result.data; 
    const { name } = job;
    const { income } = getSnapshot.data;

    // => Build the embed
    const embed = createCustomEmbed({
        thumbnail: targetUser.displayAvatarURL({ dynamic: false }),
        title: `${targetUser.username}'s Career Info (DEMO)`,
        fields: [
            {
                name: `Job Name`,
                value: `${name.toString()}`,
                inline: true 
            },
            {
                name: `Total Balance`,
                value: `${balance.toString()}`,
                inline: true
            },
            {
                name: `Total Income`,
                value: `${income.toString() ?? `N/A`}`,
                inline: true
            },
            {
                name: `Career Level`,
                value: `${level.toString()}`,
                inline: true
            }
    
        ]
    })

    // => Send the embed
    interaction.reply({ embeds: [embed] })
}
