const { MessageFlags } = require('discord.js');
const { createCustomEmbed } = require("../../assets/embed");
const { getRequest } = require('../../database/connection');
const { unixTimestamp } = require("../../lib/helpers/TimeDateHelpers/timeHelper");
const { deferInteraction, followUpInteraction, replyInteraction } = require('../../utils/InteractionManager');

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
    const userCareer = await getRequest(`/guilds/${interaction.guildId}/economy/career/${targetUser.id}`);
    const careerIncome = await getRequest(`/guilds/${interaction.guildId}/activities/sum/${targetUser.id}/daily-work?totalType=income`);
    const careerStreak = await getRequest(`/guilds/${interaction.guildId}/activities/streak/${targetUser.id}/daily-work`);

    // If the (required) request was not successful, return an error
    if (userCareer.status !== 200) {
        return followUpInteraction(interaction, {
            content: `Uh oh! The user ${targetUser.username} has no career yet.`,
            flags: MessageFlags.Ephemeral
        });
    }

    // Set the data from the requests
    const { level, createdAt, updatedAt } = userCareer.data;
    const { name, emoji, description, salary, payRaise } = userCareer.data.job;

    const totalIncome = careerIncome.data.total || 0;
    const currentStreak = careerStreak.data.streak || 0;

    const startCareerDate = new Date(createdAt);
    const lastTimeWorked = new Date(updatedAt);

    // Create an embed to display the user's career
    const messageEmbed = createCustomEmbed({
        thumbnail: targetUser.displayAvatarURL({ dynamic: false }),
        fields: [
            {
                name: `${emoji} ${name.toString()}`,
                value: `${description}\n-# Since <t:${unixTimestamp(startCareerDate)}:d> (<t:${unixTimestamp(startCareerDate)}:R>)\n-# Last worked on <t:${unixTimestamp(lastTimeWorked)}:d> (<t:${unixTimestamp(lastTimeWorked)}:R>)`,
                inline: true
            },
            { // Add a blank field
                name: "\t",
                value: "\t"
            },
            {
                name: `Salary`,
                value: `\`$ ${salary.toLocaleString()}\``,
                inline: true
            },
            {
                name: `Pay Raise`,
                value: `\`${payRaise}%\``,
                inline: true
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
            { // Add a blank field
                name: "\t",
                value: "\t"
            },
            {
                name: `Work Streak`,
                value: `\`${currentStreak.toLocaleString()} day${currentStreak === 1 ? "" : "s"}\``,
                inline: true
            }
        ]
    })

    // Reply with the messageEmbed
    return replyInteraction(interaction, {
        embeds: [messageEmbed],
        flags: MessageFlags.Ephemeral
    });
}