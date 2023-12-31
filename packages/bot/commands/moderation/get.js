const { ActionRowBuilder } = require("discord.js");
const { createCustomEmbed } = require("../../assets/embed");
const { getRequest } = require("../../database/connection");
const ClientButtonsEnum = require("../../assets/embed-buttons");

module.exports.props = {
    commandName: "get",
    description: "Get user information and logs",
    usage: "/get [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "User to get information about",
                type: 6,
                required: true,
            },
        ],
    },
    defaultMemberPermissions: ['KickMembers'],
};

module.exports.run = async (client, interaction, AuditLogs = []) => {
    // Get User details from the interaction options
    const targetUser = interaction.options.get("user").user;

    // Fetch the user by userId
    const member = await interaction.guild.members.fetch(targetUser.id)

    // Check if the member has AuditLogs
    const memberLogs = await getRequest(`/logs/${interaction.guildId}/${targetUser.id}`);
    if (memberLogs.status == 200) {
        AuditLogs = memberLogs.data
    }

    // Filter memberLogs from new to old
    const sortLogs = AuditLogs.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 3); // Only get the first 3 logs

    // Create embed fields for the logs
    const logFields = sortLogs.map(log => {
        return {
            name: `${log.type}`,
            value: `
        **Reason:** ${log.reason ? log.reason : "No reason provided."}
        **Executor:** <@${log.executorId}> | ${log.executorId}
        ${log.duration ? `**Duration:** ${log.duration}` : ""}
        `,
            inline: false
        };
    });

    // If there are more than 3 logs, add a field with the amount of logs left
    if (AuditLogs.length > 3) {
        logFields.push({
            name: "...",
            value: `**${AuditLogs.length - 3}** more log${AuditLogs.length > 1 ? "s" : ""}...`,
            inline: false
        })
    }

    // Construct message Embed
    const messageEmbed = createCustomEmbed({
        title: "Member Information",
        description: `<@${targetUser.id}> - ${targetUser.id}`,
        thumbnail: targetUser.displayAvatarURL({ dynamic: true }),
        fields: [
            {
                name: "Joined:",
                value: `${member.joinedAt.toUTCString()}`,
                inline: true
            },
            {
                name: "Created:",
                value: `${member.user.createdAt.toUTCString()}`,
                inline: true
            },
            ...logFields
        ],
    })

    // Construct message components
    const logsButton = AuditLogs.length >= 3 ? [ClientButtonsEnum.LOGS] : [];
    const messageComponents = new ActionRowBuilder()
        .addComponents(
            ...logsButton,
            ClientButtonsEnum.AVATAR
        );

    // Return the message
    return interaction.reply({
        embeds: [messageEmbed],
        components: [messageComponents],
        ephemeral: false
    })

}