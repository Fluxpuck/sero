const { getRequest, postRequest } = require("../../database/connection");
const { createCustomEmbed } = require("../../assets/embed");
const { getTimeUntil } = require("../../lib/helpers/TimeDateHelpers/timeHelper");
const { getReward } = require("../../lib/helpers/EconomyHelpers/economyHelper");
const { deferInteraction, followUpInteraction, replyInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "work-reward",
    description: "Get a reward for completing a work-week.",
    usage: "/work-reward",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Check if the user has already claimed their daily work reward
    const userCareer = await getRequest(`/guilds/${interaction.guildId}/economy/career/${interaction.user.id}`);
    if (userCareer.status !== 200) {
        return followUpInteraction(interaction, {
            content: "Oh no! You do not have a career yet. Use \`/work\` to select a job and start working.",
            ephemeral: true
        });
    }

    // Check if the user has already claimed their weekly reward
    const weeklyRewardResult = await getRequest(`/guilds/${interaction.guildId}/activities/user/${interaction.user.id}/daily-work-reward?thisWeek=true`);
    if (weeklyRewardResult.status === 200) {
        return followUpInteraction(interaction, {
            content: `You have already claimed your reward this week! Please try again in ${getTimeUntil('nextweek')}.`,
            ephemeral: true
        });
    }

    // Check if the user has a streak of at least 5 days
    const careerStreak = await getRequest(`/guilds/${interaction.guildId}/activities/streak/${interaction.user.id}/daily-work`);
    if (careerStreak.status !== 200 || careerStreak.data.streak < 5) {
        return followUpInteraction(interaction, {
            content: "Oh Uh! You need to have a streak of at least 5 days to claim your weekly reward!",
            ephemeral: true
        });
    }

    // Get the reward amount based on the streak
    const { streak = 1 } = careerStreak.data;
    const rewardAmount = getReward(streak);

    // Get Job Information
    const { job } = userCareer.data;
    const { emoji, name, } = job;

    // Create message embed
    const embed = createCustomEmbed({
        description: `Congratulations! For successfully completing your work-week, **${rewardAmount}** coins have been deposited into your bank account.`,
        footer: { text: `${emoji} ${name} - ${interaction.user.username}` }
    })

    // Store the transfer activity in the database
    postRequest(`/guilds/${interaction.guild.id}/activities`, {
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        type: "daily-work-reward",
        additional: {
            reward: rewardAmount,
        }
    });

    // Give the user the target amount of money
    const bankDeposit = await postRequest(`guilds/${interaction.guild.id}/economy/bank/${interaction.user.id}`, { amount: rewardAmount });
    if (bankDeposit?.status !== 200) {
        return followUpInteraction(interaction, {
            content: `Uh oh! Something went wrong while sending your hard earned money.`,
            ephemeral: true
        })
    } else { // reply with the embed
        return replyInteraction(interaction, {
            embeds: [embed],
            ephemeral: false
        })
    }
}