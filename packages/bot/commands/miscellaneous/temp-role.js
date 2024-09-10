const { postRequest } = require("../../database/connection");
const { findUser } = require("../../lib/resolvers/userResolver");

module.exports.props = {
    commandName: "temp-role",
    description: "Give a user a temporary role for a specific duration",
    usage: "/temp-role [user] [role] [duration]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "Select a user to give a temporary role to",
                type: 6,
                required: true,
            },
            {
                name: "role",
                description: "Select a role to give to the user",
                type: 8,
                required: true,
            },
            {
                name: "duration",
                type: 10,
                description: "The amount (in hours) of time you want to give the role for",
                required: true,
                minValue: 1,
                maxValue: 168,
            },
        ],
    },
    defaultMemberPermissions: ['ModerateMembers'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    // Get the user and role from the interaction
    const targetUser = interaction.options.get("user").user;
    const targetRole = interaction.options.get("role").role;
    const duration = interaction.options.get("duration")?.value;

    // Fetch full member details
    const member = findUser(interaction.guild, targetUser.id);

    // Post the temporary role to the database
    const result = await postRequest(`/guilds/${interaction.guildId}/roles/add`, { userId: targetUser.id, roleId: targetRole.id, duration: duration });

    // If the request was not successful, return an error
    if (result?.status !== 201) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: "Something went wrong while storing the temporary role",
            ephemeral: true
        })
    } else {

        try {
            // Give the user the temporary role
            await member.roles.add(targetRole, `test`)
        } catch (error) {
            await interaction.deleteReply();
            return interaction.followUp({
                content: "Something went wrong while gifting the temporary role",
                ephemeral: true
            })
        }

        // Send the success message
        return interaction.editReply({
            content: `<@${targetUser.id}> has recieved role "**${targetRole.name}**" for **${duration}** ${duration > 1 ? "hours" : "hour"}!`,
            ephemeral: false
        });
    }

}