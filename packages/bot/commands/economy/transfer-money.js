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
                    { name: "Wallet", value: "wallet" },
                    { name: "Bank", value: "bank" },
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
    const transferType = interaction.options.get("to")?.value || "wallet";
    let withdrawAmount = transferAmount, depositAmount = transferAmount;

    switch (transferType) {
        case "wallet":

            console.log("transfer to wallet");

            const bankWithdraw = await postRequest(`/guilds/${interaction.guildId}/economy/bank/${interaction.user.id}`, { amount: -withdrawAmount, allowNegative: false });
            withdrawAmount = bankWithdraw?.data?.transaction?.trueAmount // Set the true amount of the transaction
            const walletDeposit = await postRequest(`/guilds/${interaction.guildId}/economy/wallet/${interaction.user.id}`, { amount: +depositAmount, });
            depositAmount = walletDeposit?.data?.transaction?.trueAmount

            console.log("bankWithdraw", bankWithdraw);
            console.log("walletDeposit", walletDeposit);

            console.log("withdrawAmount", withdrawAmount);
            console.log("depositAmount", depositAmount);

            if (bankWithdraw.status === 400 || withdrawAmount === 0) {
                return followUpInteraction(interaction, {
                    content: "You don't have enough money in the bank to transfer",
                    ephemeral: true
                });
            }

            if (walletDeposit.status === 400 || depositAmount === 0) {
                return followUpInteraction(interaction, {
                    content: `Your wallet is already too stacked`,
                    ephemeral: true
                });
            }

            if (bankWithdraw.status !== 200 || walletDeposit.status !== 200) {
                return followUpInteraction(interaction, {
                    content: `Something went wrong while transferring money`,
                    ephemeral: true
                });
            }

            await replyInteraction(interaction, {
                content: `**${depositAmount.toLocaleString()}** cash was withdrawn from your bank to your wallet!`,
                ephemeral: false
            });

            break;
        case "bank":

            console.log("transfer to bank");

            const walletWithdraw = await postRequest(`/guilds/${interaction.guildId}/economy/wallet/${interaction.user.id}`, { amount: -withdrawAmount, allowReset: true });
            withdrawAmount = walletWithdraw?.data?.transaction?.trueAmount // Set the true amount of the transaction
            const bankDeposit = await postRequest(`/guilds/${interaction.guildId}/economy/bank/${interaction.user.id}`, { amount: +depositAmount });
            depositAmount = bankDeposit?.data?.transaction?.trueAmount

            if (walletWithdraw.status === 400 || withdrawAmount === 0) {
                return followUpInteraction(interaction, {
                    content: "You don't have enough cash in your wallet to transfer",
                    ephemeral: true
                });
            }

            if (bankDeposit.status === 400 || depositAmount === 0) {
                return followUpInteraction(interaction, {
                    content: `You've reached your bank limit`,
                    ephemeral: true
                });
            }

            if (walletWithdraw.status !== 200 || bankDeposit.status !== 200) {
                return followUpInteraction(interaction, {
                    content: "Something went wrong while transferring money",
                    ephemeral: true
                });
            }

            await replyInteraction(interaction, {
                content: `**${depositAmount.toLocaleString()}** was deposited from your wallet to the bank!`,
                ephemeral: false
            });

            break;
        default:
            return followUpInteraction(interaction, {
                content: "Invalid transfer type",
                ephemeral: true
            });

    }
}