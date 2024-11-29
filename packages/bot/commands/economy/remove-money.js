const { postRequest } = require("../../database/connection");
const { deferInteraction, replyInteraction, followUpInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "remove-money",
    description: "Remove money from a user.",
    usage: "/remove-money [user] [amount]",
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
    const targetType = interaction.options.get("type")?.value || "wallet";


    switch (targetType) {
        case "bank":
        // Remove balance from the target user
            const bankDeposit = await postRequest(`/guilds/${interaction.guildId}/economy/bank/${targetUser.id}`, { amount: -targetAmount });

            if (bankDeposit.status === 400) {
                return followUpInteraction(interaction, {
                    content: "The user you are trying to transfer money to has reached the bank limit.",
                    ephemeral: true
                });
            }

            if (bankDeposit.status !== 200) {
                return followUpInteraction(interaction, {
                    content: "Something went wrong while transferring money to the user.",
                    ephemeral: true
                });
            }

            await replyInteraction(interaction, {
                conten: `<@${targetUser.id}> recieved **${targetAmount}** money!`,
                ephemeral: false
            });

            break;
        default:
            // Remove balance from the target user
            const walletDeposit = await postRequest(`/guilds/${interaction.guildId}/economy/wallet/${targetUser.id}`, { amount: -transferAmount });

            if (walletWithdraw.status === 400) {
                return followUpInteraction(interaction, {
                    content: "You don't have enough money in your wallet to transfer.",
                    ephemeral: true
                });
            }

            if (walletDeposit.status === 400) {
                return followUpInteraction(interaction, {
                    content: "The user you are trying to transfer money to has reached the wallet limit.",
                    ephemeral: true
                });
            }

            if (walletWithdraw.status !== 200 || walletDeposit.status !== 200) {
                return followUpInteraction(interaction, {
                    content: "Something went wrong while transferring money to the user.",
                    ephemeral: true
                });
            }

            await replyInteraction(interaction, {
                content: `**${transferAmount.toLocaleString()}** cash was successfully given to <@${targetUser.id}>!`,
                ephemeral: false
            });

    }

}
