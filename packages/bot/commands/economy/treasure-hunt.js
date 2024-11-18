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
    await interaction.deferReply({ ephemeral: false });

    const hourlyRewardResult = await getRequest(`/guilds/${interaction.guildId}/activities/user/${interaction.user.id}/treasure-hunt?thisHour=true`);

    if (hourlyRewardResult.status === 200) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: `You've already searched for treasure! Please try again in ${getTimeUntil('nexthour')}.`,
            ephemeral: true
        });
    }

    // Generate random reward amount
    const isPositive = Math.random() < 0.4;
    const MIN = isPositive ? 0 : -400;
    const MAX = isPositive ? 250 : 0;
    const rewardAmount = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;

    // Generate random treasure message
    const TREASURE_MESSAGES = isPositive ? TREASURE_MESSAGES_POSITIVE : TREASURE_MESSAGES_NEGATIVE;
    const treasureMessage = TREASURE_MESSAGES[Math.floor(Math.random() * TREASURE_MESSAGES.length)].replace('{COIN}', `**${Math.abs(rewardAmount)}**`);

    await postRequest(`/guilds/${interaction.guild.id}/activities`, {
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        type: "treasure-hunt",
        additional: { reward: rewardAmount }
    });

    const result = await postRequest(`/guilds/${interaction.guildId}/economy/balance/${interaction.user.id}`, { amount: rewardAmount });

    if (result?.status !== 200) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: `Uh oh! Something went wrong while sending your hard earned money.`,
            ephemeral: true
        });
    }

    return interaction.editReply({
        content: treasureMessage,
        ephemeral: false
    });
}