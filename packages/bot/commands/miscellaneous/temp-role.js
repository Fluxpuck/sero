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
                autocomplete: true
            },
        ],
    },
    defaultMemberPermissions: ['ModerateMembers'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    // Get the user and role from the interaction
    const user = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');
    const duration = interaction.options.getInteger('duration');

    console.log(user, role, duration);

    // Post the temporary role to the database
    const result = await postRequest(`/guilds/${interaction.guildId}/roles/add`, { userId: user.id, roleId: role.id, duration: duration });

    // If the request was not successful, return an error
    if (result?.status !== 200) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: "Something went wrong while setting the temporary role.",
            ephemeral: true
        })
    } else {

        // Give the user the temporary role
        await user.roles.add(role, `Give temp role ${role.name}`).catch(async (err) => {
            await interaction.deleteReply();
            return interaction.followUp({
                content: "Something went wrong while setting your away status.",
                ephemeral: true
            })
        });

        return interaction.editReply({
            content: `<@${interaction.user.id}> has recieved **${role.name}** for **${duration}** ${duration > 1 ? "hours" : "hour"}!`,
            ephemeral: false
        });
    }

}