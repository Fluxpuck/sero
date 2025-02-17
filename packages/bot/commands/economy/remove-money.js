const { MessageFlags } = require('discord.js');
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
    let transactionAmount = targetAmount;

    switch (targetType) {
        case "bank":

            const bankWithdraw = await postRequest(`/guilds/${interaction.guildId}/economy/bank/${targetUser.id}`, { amount: -targetAmount });

            // Set the true amount of the transaction
            transactionAmount = bankWithdraw?.data?.transaction?.trueAmount ?? targetAmount;

            if (bankWithdraw.status === 400 || transactionAmount === 0) {
                return followUpInteraction(interaction, {
                    content: `<@${targetUser.id}> has reached their bank limit`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if (bankWithdraw.status !== 200) {
                return followUpInteraction(interaction, {
                    content: `Something went wrong while withdrawing money from <@${targetUser.id}>`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await replyInteraction(interaction, {
                conten: `**${transactionAmount.toLocaleString()}** was removed from <@${targetUser.id}>!`,
            });

            break;
        default:

            const walletWithdraw = await postRequest(`/guilds/${interaction.guildId}/economy/wallet/${targetUser.id}`, { amount: -targetAmount, allowReset: false });

            // Get the true amount of the transaction
            transactionAmount = walletWithdraw?.data?.transaction?.trueAmount ?? targetAmount;

            if (walletWithdraw.status === 400 || transactionAmount === 0) {
                return followUpInteraction(interaction, {
                    content: `<@${targetUser.id}> is too broke to take cash from!`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if (walletWithdraw.status !== 200) {
                return followUpInteraction(interaction, {
                    content: `Something went wrong while taking cash from <@${targetUser.id}>`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await replyInteraction(interaction, {
                content: `**${transactionAmount.toLocaleString()}** cash was taken from <@${targetUser.id}>!`,
            });

    }

}
