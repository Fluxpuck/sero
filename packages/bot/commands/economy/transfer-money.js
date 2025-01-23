const { MessageFlags } = require('discord.js');
const { postRequest } = require("../../database/connection");
const { deferInteraction, replyInteraction, followUpInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "transfer-money",
    description: "Transfer money between your wallet and bank",
    usage: "/transfer-money [amount] [to]",
    interaction: {
        type: 1,
        options: [
            {
                name: "amount",
                description: "The amount of coins to transfer to the user",
                type: 10,
                required: true,
                minValue: 1,
                maxValue: 10_000,
            },
            {
                name: "to",
                description: "Where you want to transfer the money to",
                type: 3,
                choices: [
                    { name: "Wallet", value: "toWallet" },
                    { name: "Bank", value: "toBank" },
                ],
                required: false
            }
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
    cooldown: 2 * 60,
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Get the amount and wallet/bank type from the interaction
    const transferAmount = interaction.options.get("amount").value;
    const transferType = interaction.options.get("to")?.value || "toWallet";

    switch (transferType) {
        case "toWallet":

            const walletTransfer = await postRequest(`/guilds/${interaction.guildId}/economy/transfer/bank-to-wallet/${interaction.user.id}`, { amount: transferAmount });

            const walletTransaction = walletTransfer?.data?.transaction;
            if (!walletTransaction) {
                return followUpInteraction(interaction, {
                    content: "Oops! An error occurred while transferring the money",
                    flags: MessageFlags.Ephemeral
                });
            }

            if (walletTransaction.actualTransferAmount === 0) {
                return followUpInteraction(interaction, {
                    content: "You don't have enough money in the bank to transfer",
                    flags: MessageFlags.Ephemeral
                });
            }

            await replyInteraction(interaction, {
                content: `**${walletTransaction.actualTransferAmount.toLocaleString()}** was transferred from the bank to your wallet!`,
                ephemeral: false
            });

            break;

        case "toBank":

            const bankTransfer = await postRequest(`/guilds/${interaction.guildId}/economy/transfer/wallet-to-bank/${interaction.user.id}`, { amount: transferAmount });

            const bankTransaction = bankTransfer?.data?.transaction;
            if (!bankTransaction) {
                return followUpInteraction(interaction, {
                    content: "Oops! An error occurred while transferring the money",
                    flags: MessageFlags.Ephemeral
                });
            }

            if (bankTransaction.actualTransferAmount === 0) {
                return followUpInteraction(interaction, {
                    content: "You don't have enough money in your wallet to transfer",
                    flags: MessageFlags.Ephemeral
                });
            }

            await replyInteraction(interaction, {
                content: `**${bankTransaction.actualTransferAmount.toLocaleString()}** was transferred from your wallet to the bank!`,
                ephemeral: false
            });

            break;
        default:
            return followUpInteraction(interaction, {
                content: "Invalid transfer type",
                flags: MessageFlags.Ephemeral
            });

    }
}