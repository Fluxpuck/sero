const { getRequest } = require("../../database/connection");
const { createCustomEmbed } = require("../../assets/embed");
const { deferInteraction, replyInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "balance",
    description: "Get the balance of a user.",
    usage: "/reset [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to get th balance of",
                required: false
            }
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Get User details from the interaction options
    const targetUser = interaction.options.get("user")?.user || interaction.user;

    // Get the user's bank and wallet balance
    const userBalance = await getRequest(`/guilds/${interaction.guildId}/economy/balance/${targetUser.id}`);
    const { bank_balance = 0, wallet_balance = 0 } = userBalance?.data;

    // Create an embed to display the user's balance
    const messageEmbed = createCustomEmbed({
        description: `
            🏦 - \`${bank_balance.toLocaleString()}\` bank
            🪙 - \`${wallet_balance.toLocaleString()}\` wallet
            `
    });

    // Reply with the messageEmbed
    return replyInteraction(interaction, {
        embeds: [messageEmbed],
    });
}
