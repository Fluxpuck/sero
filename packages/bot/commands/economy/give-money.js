const { postRequest, getRequest } = require("../../database/connection");
const { deferInteraction, replyInteraction, followUpInteraction } = require('../../utils/InteractionManager');

module.exports.props = {
    commandName: "give-money",
    description: "Give money to a user.",
    usage: "/give-money [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to give money to.",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of money to give to the user",
                required: true,
                minValue: 1,
                maxValue: 1_000_000,
            },
            {
                name: "type",
                type: 3,
                description: "The type of account to transfer money from",
                choices: [
                    { name: "Wallet", value: "wallet" },
                    { name: "Bank", value: "bank" },
                ],
                required: false
            }
        ],
    },
    defaultMemberPermissions: ['ManageGuild'],
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const targetAmount = interaction.options.get("amount").value;

    // Give the user the target amount of money
    const result = await postRequest(`/guilds/${interaction.guildId}/economy/balance/${targetUser.id}`, { amount: targetAmount });

    // If the request was not successful, return an error
    if (result?.status !== 200) {
        await followUpInteraction(interaction, {
            content: `Uh oh! Something went wrong while giving money to ${targetUser.username}.`,
            ephemeral: true
        });
    } else {
        await replyInteraction(interaction, {
            content: `<@${targetUser.id}> has received **${targetAmount}** money!`,
            ephemeral: false
        });
    }
}