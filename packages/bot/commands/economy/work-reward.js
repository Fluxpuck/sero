const { getRequest, postRequest } = require("../../database/connection");
const { getTimeUntilTomorrow } = require("../../lib/helpers/TimeDateHelpers/timeHelper");

module.exports.props = {
    commandName: "work-reward",
    description: "Get a reward for completing a work-week.",
    usage: "/work-reward",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    // Check if the user has already claimed their daily work reward
    const weeklyRewardResult = await getRequest(`/guilds/${interaction.guildId}/activities/user/${interaction.user.id}/daily-work-reward?thisWeek=true`);
    const userCareer = await getRequest(`/guilds/${interaction.guildId}/economy/career/${interaction.user.id}`);

    // Check if the user has a career
    if (userCareer.status !== 200) {
        return interaction.editReply({
            content: "Oh no! You do not have a career yet. Use \`/work\` to select a job and start working.",
            ephemeral: true
        });
    }

    // Check if the user has already claimed their daily work reward
    if (weeklyRewardResult.status === 200) {
        return interaction.editReply({
            content: `You have already claimed your reward today! Please try again in ${getTimeUntilTomorrow()}.`,
            ephemeral: true
        });
    } else {

        const careerStreak = await getRequest(`/guilds/${interaction.guildId}/activities/streak/${interaction.user.id}/daily-work-reward`);
        if (careerStreak.status !== 200 || careerStreak.data.streak < 5) {
            return interaction.editReply({
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
                await interaction.deleteReply();
                return interaction.followUp({
                    content: `Uh oh! Something went wrong while sending your hard earned money.`,
                    ephemeral: true
                })
            } else {
                // reply with the embed
                return interaction.editReply({
                    embeds: [embed],
                    ephemeral: false
                })
            }
        }
    }
}



function getReward(streak) {
    const rewards = [
        { days: 5, reward: 100 },
        { days: 15, reward: 150 },
        { days: 30, reward: 200 },
        { days: 50, reward: 250 },
        { days: 75, reward: 350 },
        { days: 100, reward: 500 },
        { days: 130, reward: 650 },
        { days: 150, reward: 800 },
        { days: 180, reward: 1000 },
        { days: 210, reward: 1250 },
        { days: 250, reward: 1500 },
        { days: 300, reward: 2000 },
        { days: 365, reward: 2500 }
    ];

    for (const tier of rewards) {
        if (streak <= tier.days) {
            return tier.reward;
        }
    }

    return 2000;
}