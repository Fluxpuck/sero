const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const { createCustomEmbed } = require("../../assets/embed");
const { JOB_MESSAGES } = require("../../assets/job-messages");
const { postRequest, getRequest } = require("../../database/connection");
const { calculateDailyIncome } = require("../../lib/helpers/EconomyHelpers/economyHelper");
const { getTimeUntil } = require("../../lib/helpers/TimeDateHelpers/timeHelper");
const { getUserCareerJobOptions } = require("../../lib/resolvers/userJobResolver");
const { deferInteraction, replyInteraction, updateInteraction } = require("../../utils/InteractionManager");

// Command properties
module.exports.props = {
    commandName: "work",
    description: "Work to earn money!",
    usage: "/work",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
    cooldown: 2 * 60
};

// Helper functions
const createJobSelectButtons = (jobs) => {
    return jobs.map(job => new ButtonBuilder()
        .setCustomId(job.jobId)
        .setLabel(job.name)
        .setStyle(ButtonStyle.Primary));
};

const createJobFields = (jobs, level = 1) => {
    return jobs.map(job => ({
        name: `${job.emoji} - ${job.name}`,
        value: `*${job.description}*\n` +
            `Salary: \`$${job.wage.toLocaleString()}\`\n` +
            `Daily Income: \`$${calculateDailyIncome(job.wage, job.raise, level)}\`\n` +
            `Raise: \`${job.raise}%\``,
        inline: false
    }));
};

const handleNewCareer = async (interaction, jobOptions) => {
    const buttons = createJobSelectButtons(jobOptions);
    const components = [new ActionRowBuilder().addComponents(buttons)];
    const fields = createJobFields(jobOptions);

    const embed = createCustomEmbed({
        title: "Available Job Offers",
        description: "Select a job to start working!",
        fields
    });

    const response = await replyInteraction(interaction, {
        embeds: [embed],
        components
    });

    // Handle job selection
    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 3_600_000
    });

    collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) {
            return replyInteraction(i, {
                content: "You can't select a job for someone else",
                ephemeral: true
            });
        }

        const selectedJob = jobOptions.find(job => job.jobId === i.customId);
        const updatedEmbed = createCustomEmbed({
            title: "Job Selected!",
            description: "You can now use `/work` daily to earn money.",
            fields: createJobFields([selectedJob])
        });

        const result = await postRequest(
            `/guilds/${interaction.guild.id}/economy/career`,
            { userId: interaction.user.id, jobId: selectedJob.jobId, level: 1 }
        );

        if (result.status === 200) {
            return updateInteraction(i, {
                embeds: [updatedEmbed],
                components: []
            });
        }

        return updateInteraction(i, {
            content: "Failed to update career. Please try again.",
            ephemeral: true
        });
    });
};

const handleDailyWork = async (interaction, career) => {
    const { job, level } = career;
    const income = calculateDailyIncome(job.wage, job.raise, level);

    // Random job message
    const messages = JOB_MESSAGES[job.jobId];
    const message = messages[Math.floor(Math.random() * messages.length)]
        .replace('{COIN}', `**${income}**`);

    const embed = createCustomEmbed({
        description: message,
        footer: { text: `${job.emoji} ${job.name} - ${interaction.user.username}` }
    });

    // Record activity and update balance
    await Promise.all([
        postRequest(`/guilds/${interaction.guild.id}/activities`, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            type: "daily-work",
            additional: { income }
        }),
        postRequest(`/guilds/${interaction.guild.id}/economy/balance/${interaction.user.id}`,
            { amount: income }
        )
    ]);

    return replyInteraction(interaction, { embeds: [embed] });
};

// Main command handler
module.exports.run = async (client, interaction) => {
    try {
        await deferInteraction(interaction, false);

        // Check existing career
        const careerResult = await getRequest(
            `/guilds/${interaction.guild.id}/economy/career/${interaction.user.id}`
        );

        if (careerResult.status === 404) {
            const jobOptions = await getUserCareerJobOptions(interaction.guild.id, interaction.user.id);
            if (!jobOptions) throw new Error("Failed to fetch job options");
            return handleNewCareer(interaction, jobOptions);
        }

        // Check daily work completion
        const dailyWorkResult = await getRequest(
            `/guilds/${interaction.guildId}/activities/user/${interaction.user.id}/daily-work?today=true`
        );

        if (dailyWorkResult.status === 200 && dailyWorkResult.data.length > 0) {
            return replyInteraction(interaction, {
                content: `You already worked today! Try again ${getTimeUntil('tomorrow')}`,
                ephemeral: true
            });
        }

        return handleDailyWork(interaction, careerResult.data);

    } catch (error) {
        return replyInteraction(interaction, {
            content: "An error occurred. Please try again later.",
            ephemeral: true
        });
    }
};