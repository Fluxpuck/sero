const { postRequest } = require("../../database/connection");
const { deferInteraction, replyInteraction, followUpInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "transfer-money",
    description: "Transfer money to another user",
    usage: "/transfer-money [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to transfer money to",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of coins to transfer to the user",
                required: true,
                minValue: 1,
                maxValue: 10_000,
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
    defaultMemberPermissions: ['SendMessages'],
    cooldown: 2 * 60, // 2 minute cooldown
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const transferAmount = interaction.options.get("amount").value;
    const transferType = interaction.options.get("type")?.value || "wallet";
    let transactionAmount = targetAmount;

    switch (transferType) {
        case "bank":

            const bankWithdraw = await postRequest(`/guilds/${interaction.guildId}/economy/bank/${interaction.user.id}`, { amount: -transferAmount });
            const bankDeposit = await postRequest(`/guilds/${interaction.guildId}/economy/bank/${targetUser.id}`, { amount: +transferAmount });

            // Set the true amount of the transaction
            transactionAmount = bankDeposit?.data?.transaction?.trueAmount || targetAmount;

            if (bankWithdraw.status === 400) {
                return followUpInteraction(interaction, {
                    content: "You don't have enough money in the bank to transfer money",
                    ephemeral: true
                });
            }

            if (bankDeposit.status === 400 || transactionAmount === 0) {
                return followUpInteraction(interaction, {
                    content: `Something went wrong while transferring money to <@${targetUser.id}>`,
                    ephemeral: true
                });
            }

            if (bankWithdraw.status !== 200 || bankDeposit.status !== 200) {
                return followUpInteraction(interaction, {
                    content: "Something went wrong while transferring money to the user",
                    ephemeral: true
                });
            }

            await replyInteraction(interaction, {
                content: `**${transferAmount.toLocaleString()}** was wired to <@${targetUser.id}>!`,
                ephemeral: false
            });

            break;
        default:

            const walletWithdraw = await postRequest(`/guilds/${interaction.guildId}/economy/wallet/${interaction.user.id}`, { amount: -transferAmount });
            const walletDeposit = await postRequest(`/guilds/${interaction.guildId}/economy/wallet/${targetUser.id}`, { amount: +transferAmount });

            // Set the true amount of the transaction
            transactionAmount = walletDeposit?.data?.transaction?.trueAmount || targetAmount;

            if (walletWithdraw.status === 400) {
                return followUpInteraction(interaction, {
                    content: "You don't have enough cash in your wallet to transfer.",
                    ephemeral: true
                });
            }

            if (walletDeposit.status === 400 || transactionAmount === 0) {
                return followUpInteraction(interaction, {
                    content: `<@${targetUser.id}>'s wallet is too stacked to receive cash`,
                    ephemeral: true
                });
            }

            if (walletWithdraw.status !== 200 || walletDeposit.status !== 200) {
                return followUpInteraction(interaction, {
                    content: `Something went wrong while transferring cash to <@${targetUser.id}>`,
                    ephemeral: true
                });
            }

            await replyInteraction(interaction, {
                content: `**${transferAmount.toLocaleString()}** cash was transferred to <@${targetUser.id}>!`,
                ephemeral: false
            });

    }
}