const { MessageFlags } = require('discord.js');
const { createCustomEmbed } = require("../../assets/embed");
const { getRequest } = require('../../database/connection');
const { unixTimestamp } = require("../../lib/helpers/TimeDateHelpers/timeHelper");
const { deferInteraction, followUpInteraction, replyInteraction } = require('../../utils/InteractionManager');
const { calculateDailyIncome } = require('../../lib/helpers/EconomyHelpers/economyHelper');

module.exports.props = {
    commandName: "career",
    description: "Get information on the career of a user.",
    usage: "/career [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to get their career info of",
                required: false
            }
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Get User details from the interaction options
    const targetUser = interaction.options.get("user")?.user || interaction.user;
    if (!targetUser) {
        return followUpInteraction(interaction, {
            content: "Oops! Something went wrong while trying to fetch the user.",
            flags: MessageFlags.Ephemeral
        });
    }

    // Get the user's career && career snapshots
    // Missing Route: API routes for career, activities/sum, and activities/streak need to be implemented
    const [userCareer, careerIncome, careerStreak] = await Promise.all([
        getRequest(`/guild/${interaction.guildId}/economy/career/${targetUser.id}`),
        getRequest(`/guild/${interaction.guildId}/activities/sum/${targetUser.id}/daily-work?totalType=income`),
        getRequest(`/guild/${interaction.guildId}/activities/streak/${targetUser.id}/daily-work`)
    ]);

    // If the (required) request was not successful, return an error
    if (userCareer.status !== 200) {
        return followUpInteraction(interaction, {
            content: `Uh oh! The user ${targetUser.username} has no career yet.`,
            flags: MessageFlags.Ephemeral
        });
    }

    // Set the data from the requests
    // Destructure career data with safe defaults
    const {
        level = 0,
        createdAt = Date.now(),
        updatedAt = Date.now(),
        job: {
            name = 'Unemployed',
            emoji = '💼',
            description = 'This user has not started their career yet.',
            salary = 0,
            payRaise = 0
        } = {}
    } = userCareer?.data || {};

    // Calculate financial information
    const dailyIncome = Math.max(0, calculateDailyIncome(salary, payRaise, level));
    const totalIncome = Math.max(0, careerIncome?.data?.total || 0);
    const currentStreak = Math.max(0, careerStreak?.data?.streak || 0);

    const startCareerDate = new Date(createdAt);
    const lastTimeWorked = new Date(updatedAt);

    // Create an embed to display the user's career
    const messageEmbed = createCustomEmbed({
        thumbnail: targetUser.displayAvatarURL({ dynamic: false }),
        fields: [
            {
                name: `${emoji} ${name.toString()}`,
                value: `${description}\n-# First day on <t:${unixTimestamp(startCareerDate)}:d> (<t:${unixTimestamp(startCareerDate)}:R>)\n-# Last worked on <t:${unixTimestamp(lastTimeWorked)}:d> (<t:${unixTimestamp(lastTimeWorked)}:R>)`,
                inline: true
            },
            { // Add a blank field
                name: "\t",
                value: "\t"
            },
            {
                name: `Yearly Salary`,
                value: `\`$${salary.toLocaleString()}\``,
                inline: true
            },
            {
                name: `Daily Salary`,
                value: `\`$${dailyIncome.toLocaleString()}\``,
                inline: true
            },
            {
                name: `Pay Raise (per level)`,
                value: `\`${payRaise} %\``,
                inline: true
            },
            { // Add a blank field
                name: "\t",
                value: "\t"
            },
            {
                name: `Total Income`,
                value: `\`$${totalIncome.toLocaleString()}\``,
                inline: true
            },
            {
                name: `Career Level`,
                value: `\`Level ${level.toLocaleString()}\``,
                inline: true
            },
            {
                name: `Work Streak`,
                value: `\`${currentStreak.toLocaleString()} day${currentStreak === 1 ? "" : "s"}\``,
                inline: true
            },
        ]
    })

    // Reply with the messageEmbed
    return replyInteraction(interaction, {
        embeds: [messageEmbed],
        flags: MessageFlags.Ephemeral
    });
}