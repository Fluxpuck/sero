module.exports.props = {
    commandName: "logchannel",
    description: "Get a list of all log channels for the server",
    usage: "/logchannel",
    interaction: {},
    defaultMemberPermissions: ['ManageGuild'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    /*
    1. Fetch the servers log-channels per log Category
    2. Create and send an embed with log-channels
    */

}