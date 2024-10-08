const { ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } = require("discord.js");
const { createCustomEmbed } = require("../../assets/embed");
const { JOB_MESSAGES } = require("../../assets/job-messages");
const { postRequest, getRequest } = require("../../database/connection");
const { calculateDailyIncome, calculateBaseIncome } = require("../../lib/helpers/EconomyHelpers/economyHelper");
const { getTimeUntilTomorrow } = require("../../lib/helpers/TimeDateHelpers/timeHelper");
const { getUserCareerJobOptions } = require("../../lib/resolvers/userJobResolver");

module.exports.props = {
    commandName: "work",
    description: "Work to earn money!",
    usage: "/work",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
    cooldown: 2 * 60, // 2 minute cooldown
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    // Fetch the user's career (job)
    const userCareerResult = await getRequest(`/guilds/${interaction.guild.id}/economy/career/${interaction.user.id}`);
    if (userCareerResult.status === 404) {

        // Fetch the user's job options
        const jobOptions = await getUserCareerJobOptions(interaction.guild.id, interaction.user.id);

        // Set default career level
        const DEFAULT_CAREER_LEVEL = 1;

        // Dynamicly create buttons for the jobs
        const jobButtons = [];
        jobOptions.forEach(job => {
            const button = new ButtonBuilder()
                .setCustomId(`${job.jobId}`)
                .setLabel(`${job.name}`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false);
            jobButtons.push(button);
        });

        // Add the buttons the ActionRow
        const messageComponents = new ActionRowBuilder()
            .addComponents(...jobButtons);

        // Create message fields
        const jobFields = jobOptions.map(job => {

            // Calculate the income based on the user's career
            const income = calculateDailyIncome(job.wage, job.raise, DEFAULT_CAREER_LEVEL);
            const salary = job.wage.toLocaleString();

            return {
                name: `${job.emoji} - ${job.name}`,
                value: `*${job.description}*\nSalary: \`$${salary}\`\nDaily Income (base): \`$${income}\`\nRaise (per level): \`${job.raise}%\``,
                inline: false
            }
        })

        // Create message embed
        const messageEmbed = createCustomEmbed({
            title: "Available jobs offers",
            description: "Please select a job to start working!",
            fields: [...jobFields],
        })

        // Send the message
        const response = await interaction.editReply({
            embeds: [messageEmbed],
            components: [messageComponents],
            ephemeral: false
        })

        // Collect the button selection
        const options = { componentType: ComponentType.Button, idle: 300_000, time: 3_600_000 }
        const collector = response.createMessageComponentCollector({ options });
        collector.on('collect', async i => {

            // Block input from other users
            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: `Oops! You can't select a job for someone else.`,
                    ephemeral: true
                })
            }

            const selectedButton = i.customId;

            // Get the selected job
            const selectedJob = jobOptions.find(job => job.jobId == selectedButton);
            const income = calculateBaseIncome(selectedJob.wage);
            const salary = selectedJob.wage.toLocaleString();

            // Update embed Footer && Fields
            messageEmbed.setTitle(`You have selected a job!`);
            messageEmbed.setDescription(`You will be able to execute \`/work\` on a daily basis to earn money.`);
            messageEmbed.data.fields = []; // Empty current fields
            messageEmbed.setFields(
                [
                    {
                        name: `${selectedJob.emoji} - ${selectedJob.name}`,
                        value: `*${selectedJob.description}*\nSalary: \`$${salary}\`\nDaily Income (base): \`$${income}\`\nRaise (per level): \`${selectedJob.raise}%\``,
                        inline: false
                    }
                ]
            );

            // Update the user's career
            const updateUserCareer = await postRequest(`/guilds/${interaction.guild.id}/economy/career`, { userId: interaction.user.id, jobId: selectedJob.jobId, level: 1 });

            // If the user's career was updated successfully, return a message
            if (updateUserCareer.status === 200) {
                // Update the interaction, disabling the buttons
                return i.update({
                    embeds: [messageEmbed],
                    components: [],
                })
            }

            // If the user's career was not updated successfully, return an error message
            return i.update({
                content: `Oops! Something went wrong while updating your career. Please try again later.`,
                ephemeral: true
            })

        });


    } else if (userCareerResult.status === 200) {

        // Check if the user has already worked today...
        const dailyWorkResult = await getRequest(`/guilds/${interaction.guildId}/activities/${interaction.user.id}/daily-work`);
        if (dailyWorkResult.status === 200) {

            // Get the daily-work activitie(s) of today
            const activities = dailyWorkResult.data;
            if (activities.length > 0) {
                // return a message that the user has already worked today
                await interaction.deleteReply();
                return interaction.followUp({
                    content: `You have already worked today! Please try again in ${getTimeUntilTomorrow()}.`,
                    ephemeral: true
                });
            }

        } else {
            await interaction.deleteReply();
            return interaction.followUp({
                content: `Oops! Something went wrong while fetching your daily work activities. Please try again later.`,
                ephemeral: true
            });
        }

        try {

            const { job, level } = userCareerResult.data;
            const { jobId, emoji, name, wage, raise } = job;

            // Calculate the income based on the user's career
            const income = calculateDailyIncome(wage, raise, level);

            // Get random job message, based on the jobId
            let idx = Math.floor(Math.random() * JOB_MESSAGES[jobId].length);
            const jobMessage = JOB_MESSAGES[jobId][idx].replace('{COIN}', `**${income}**`);

            // Create message embed
            const embed = createCustomEmbed({
                title: `${interaction.user.username}'s work day`,
                description: `${jobMessage}`,
                footer: { text: `${emoji} ${name}` }
            })

            // Store the transfer activity in the database
            postRequest(`/guilds/${interaction.guild.id}/activities`, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                type: "daily-work",
                additional: {
                    income: income,
                }
            });

            // reply with the embed
            return interaction.editReply({
                embeds: [embed],
                ephemeral: false
            })

        } catch (error) {
            await interaction.deleteReply();
            return interaction.followUp({
                content: `Oops! Something went wrong while working. Please try again later.`,
                ephemeral: true
            });
        }

    } else {
        await interaction.deleteReply();
        return interaction.followUp({
            content: `Oops! Something went wrong while fetching your career. Please try again later.`,
            ephemeral: true
        })
    }

}