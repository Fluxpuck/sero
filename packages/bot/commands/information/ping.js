const { replyInteraction } = require('../../utils/InteractionManager');

module.exports.props = {
    commandName: "ping",
    description: "Check the client latency",
    usage: "/ping",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    const options = { content: 'Pinging...', withResponse: true };
    const message = await replyInteraction(interaction, options);

    if (message) {
        await replyInteraction(interaction, { content: `Pong! → ${new Date().getTime() - interaction.createdTimestamp}ms` });
    }
}