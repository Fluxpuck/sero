const { getRequest, postRequest } = require("../../database/connection");
const { getTimeUntil } = require("../../lib/helpers/TimeDateHelpers/timeHelper");
const { TREASURE_MESSAGES_NEGATIVE, TREASURE_MESSAGES_POSITIVE } = require("../../assets/treasure-messages");
const { deferInteraction, replyInteraction, followUpInteraction } = require('../../utils/InteractionManager');

module.exports.props = {
    commandName: "treasure-hunt",
    description: "Hunt for treasure and earn rewards.",
    usage: "/treasure-hunt",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Check if the user has already searched for treasure this hour
    const hourlyRewardResult = await getRequest(`/guilds/${interaction.guildId}/activities/user/${interaction.user.id}/treasure-hunt?thisHour=true`);

    if (hourlyRewardResult.status === 200) {
        await replyInteraction(interaction, {
            content: `You've already searched for treasure! Please try again in ${getTimeUntil('nexthour')}.`,
            ephemeral: true
        });
    }

    const isPositive = Math.random() < 0.35; // 35% chance of positive reward
    const rewardAmount = Math.floor(Math.random() * (isPositive ? 251 : 401)) * (isPositive ? 1 : -1);

    // Deposit the reward amount to the user's wallet - allowReset is set to true to allow rewards to empty the wallet
    const walletTransaction = await postRequest(`guilds/${interaction.guild.id}/economy/wallet/${interaction.user.id}`, { amount: rewardAmount, allowReset: true });
    // Get the true amount of the transaction
    const transactionAmount = walletTransaction?.data?.transaction?.trueAmount || rewardAmount;

    if (walletTransaction.status === 400 || transactionAmount === 0) {
        return followUpInteraction(interaction, {
            content: "Damn. Seems like you are already too broke to lose any treasure.",
            ephemeral: true
        });
    }

    if (walletTransaction?.status !== 200) {
        return followUpInteraction(interaction, {
            content: `Uh oh! Something went wrong while sending your hard earned money.`,
            ephemeral: true
        });
    }

    try {
        // Store the activity in the database
        await postRequest(`/guilds/${interaction.guild.id}/activities`, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            type: "treasure-hunt",
            additional: { reward: transactionAmount }
        });
    } catch (error) {
        console.error('Failed to store treasure hunt activity:', error);
    }

    // Generate random treasure message
    const TREASURE_MESSAGES = isPositive ? TREASURE_MESSAGES_POSITIVE : TREASURE_MESSAGES_NEGATIVE;
    const treasureMessage = TREASURE_MESSAGES[Math.floor(Math.random() * TREASURE_MESSAGES.length)].replace('{COIN}', `**${Math.abs(rewardAmount)}**`);

    return replyInteraction(interaction, {
        content: treasureMessage,
        ephemeral: false
    });

}