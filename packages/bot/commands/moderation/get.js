module.exports.props = {
    commandName: "get",
    description: "Get user information and logs",
    usage: "/get [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "User to get information about",
                type: 6,
                required: true,
            },
        ],
    },
    defaultMemberPermissions: ['KickMembers'],
};

module.exports.run = async (client, interaction) => {
    // Get User details from the interaction options
    const targetUser = interaction.options.get("user").user;





}