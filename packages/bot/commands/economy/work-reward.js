const { getRequest, postRequest } = require("../../database/connection");
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
    const weeklyRewardResult = await getRequest(`/guilds/${interaction.guildId}/activities/user/${interaction.user.id}/daily-work-reward?thisWeek=true`);
    const userCareer = await getRequest(`/guilds/${interaction.guildId}/economy/career/${interaction.user.id}`);

    // Check if the user has a career
    if (userCareer.status !== 200) {
        return followUpInteraction(interaction, {
            content: "Oh no! You do not have a career yet. Use \`/work\` to select a job and start working.",
            ephemeral: true
        });
    }

    // Check if the user has already claimed their daily work reward
    if (weeklyRewardResult.status === 200) {
        return followUpInteraction(interaction, {
            content: `You have already claimed your reward today! Please try again in ${getTimeUntil('tomorrow')}.`,
            ephemeral: true
        });
    } else {

        const careerStreak = await getRequest(`/guilds/${interaction.guildId}/activities/streak/${interaction.user.id}/daily-work-reward`);
        if (careerStreak.status !== 200 || careerStreak.data.streak < 5) {
            return followUpInteraction(interaction, {
                content: "Oh Uh! You need to have a streak of at least 5 days to claim your weekly reward!",
                ephemeral: true
            });
        } else {

            // Get the reward amount based on the streak
            const rewardAmount = getReward(careerStreak.data.streak);

            const { job } = userCareerResult.data;
            const { emoji, name, } = job;

            // Create message embed
            const embed = createCustomEmbed({
                description: `Congratulations! You have completed a work-week and earned a reward of **${rewardAmount}** coins.`,
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
            const result = postRequest(`/guilds/${interaction.guildId}/economy/balance/${interaction.user.id}`, { amount: rewardAmount });

            // If the request was not successful, return an error
            if (result?.status !== 200) {
                return followUpInteraction(interaction, {
                    content: `Uh oh! Something went wrong while sending your hard earned money.`,
                    ephemeral: true
                })
            } else {
                // reply with the embed
                return replyInteraction(interaction, {
                    embeds: [embed],
                    ephemeral: false
                })
            }
        }
    }
}