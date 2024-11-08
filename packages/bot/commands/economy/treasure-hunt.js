const { getRequest, postRequest } = require("../../database/connection");
const { getTimeUntil } = require("../../lib/helpers/TimeDateHelpers/timeHelper");
const { TREASURE_MESSAGES_NEGATIVE, TREASURE_MESSAGES_POSITIVE } = require("../../assets/treasure-messages");

module.exports.props = {
    commandName: "treasure-hunt",
    description: "Hunt for treasure and earn rewards.",
    usage: "/treasure-hunt",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    // Check if the user has already claimed their daily work reward
    const hourlyRewardResult = await getRequest(`/guilds/${interaction.guildId}/activities/user/${interaction.user.id}/treasure-hunt?thisHour=true`);

    // Check if the user has already claimed their daily work reward
    if (hourlyRewardResult.status === 200) {
        return interaction.editReply({
            content: `You've already searched for treasure! Please try again in ${getTimeUntil('nexthour')}.`,
            ephemeral: true
        });
    } else {

        // Determine the reward amount
        const MIN = -1000, MAX = 2500;
        const rewardAmount = Math.floor(Math.random() * (MAX - (MIN) + 1)) + (MIN);

        // Determine if the reward is positive or negative
        const isPositive = rewardAmount >= 0;
        const TREASURE_MESSAGES = isPositive ? TREASURE_MESSAGES_POSITIVE : TREASURE_MESSAGES_NEGATIVE;

        let idx = Math.floor(Math.random() * TREASURE_MESSAGES.length);
        const treasureMessage = TREASURE_MESSAGES[idx].replace('{COIN}', `**${rewardAmount}**`);

        // Store the transfer activity in the database
        postRequest(`/guilds/${interaction.guild.id}/activities`, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            type: "treasure-hunt",
            additional: {
                reward: rewardAmount,
            }
        });

        // Give the user the target amount of money
        const result = postRequest(`/guilds/${interaction.guildId}/economy/balance/${interaction.user.id}`, { amount: rewardAmount });

        console.log(result);

        // If the request was not successful, return an error
        if (result?.status !== 200) {
            await interaction.deleteReply();
            return interaction.followUp({
                content: `Uh oh! Something went wrong while sending your hard earned money.`,
                ephemeral: true
            })
        } else {
            // reply with the embed
            return interaction.editReply({
                content: treasureMessage,
                ephemeral: false
            })
        }
    }
}