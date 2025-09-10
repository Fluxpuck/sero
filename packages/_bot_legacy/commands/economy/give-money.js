const { MessageFlags } = require('discord.js');
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
            },
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

            // Missing Route: API route for bank deposit needs to be implemented
            const bankDeposit = await postRequest(`/guild/${interaction.guildId}/economy/balance/${targetUser.id}`, { amount: +targetAmount, type: 'bank' });

            // Set the true amount of the transaction
            transactionAmount = bankDeposit?.data?.transaction?.trueAmount ?? targetAmount;

            if (bankDeposit.status === 400 || transactionAmount === 0) {
                return followUpInteraction(interaction, {
                    content: `<@${targetUser.id}> has reached their bank limit`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if (bankDeposit.status !== 200) {
                return followUpInteraction(interaction, {
                    content: `Something went wrong while depositing money to <@${targetUser.id}>`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await replyInteraction(interaction, {
                conten: `**${transactionAmount.toLocaleString()}** was given to <@${targetUser.id}>!`,

            });

            break;
        default:

            // Missing Route: API route for wallet deposit needs to be implemented
            const walletDeposit = await postRequest(`/guild/${interaction.guildId}/economy/balance/${targetUser.id}`, { amount: +targetAmount, type: 'wallet' });

            // Get the true amount of the transaction
            transactionAmount = walletDeposit?.data?.transaction?.trueAmount ?? targetAmount;

            if (walletDeposit.status === 400 || transactionAmount === 0) {
                return followUpInteraction(interaction, {
                    content: `<@${targetUser.id}>'s wallet is too stacked to receive cash`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if (walletDeposit.status !== 200) {
                return followUpInteraction(interaction, {
                    content: `Something went wrong while sending cash to <@${targetUser.id}>`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await replyInteraction(interaction, {
                content: `**${transactionAmount.toLocaleString()}** cash was given to <@${targetUser.id}>!`,

            });

    }
}