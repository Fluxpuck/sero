const { ActionRowBuilder, ComponentType } = require("discord.js");
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
            name: `${log.type} | ${log.id}`,
            value: `
        **Reason:** ${log.reason ? log.reason : "No reason provided."}
        **Executor:** <@${log.executorId}> | ${log.executorId}
        ${log.duration ? `**Duration:** ${log.duration}` : ""}
        `,
            inline: true
        };
    });

    // Construct message Embed
    const messageEmbed = createCustomEmbed({
        title: "Member Information for " + targetUser.tag,
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
        footer: {
            // If there are more than 3 logs, add a footer with the amount of logs left
            text: AuditLogs.length > 3
                ? `${AuditLogs.length - 3} more log${AuditLogs.length > 1 ? "s" : ""}...`
                : "This user has no logs..."
        }
    })

    // Construct message components
    const logsButton = AuditLogs.length >= 3 ? [ClientButtonsEnum.LOGS] : [];
    const messageComponents = new ActionRowBuilder()
        .addComponents(
            ...logsButton,
            ClientButtonsEnum.AVATAR
        );

    //make sure to RESET the disabled state of the buttons
    messageComponents.components.forEach(button => button.data.disabled = false)

    // Return the message
    const response = await interaction.reply({
        embeds: [messageEmbed],
        components: [messageComponents],
        ephemeral: false
    });

    // Collect the dropdownMenu selection
    const options = { componentType: ComponentType.Button, idle: 300_000, time: 3_600_000 }
    const collector = response.createMessageComponentCollector({ options });
    collector.on('collect', async i => {

        const selectedButton = i.customId;

        /**
         * @selectedButton - Avatar
         * Return the avatar in an embedded message
         */
        if (selectedButton === "avatar") {

            // Construct the avatar embed
            const avatarEmbed = createCustomEmbed({
                title: "Member Avatar of " + targetUser.tag,
                description: `<@${targetUser.id}> - ${targetUser.id}`,
                image: targetUser.displayAvatarURL({ dynamic: true, extension: "png", size: 512 }),
            })

            // Disable the Avatar button
            const avatarIndex = messageComponents.components.findIndex(button => button.data.custom_id === "avatar");
            messageComponents.components[avatarIndex].data.disabled = true;

            // Update the interaction, disabling the Avatar button
            await i.update({ components: [messageComponents] })

            // Send the avatar embed
            await i.followUp({ embeds: [avatarEmbed] })

        }

        /**
         * @selectedButton - Logs
         * Execute the /logs command
         */
        if (selectedButton === "logs") {

            // Remove the logs button
            const logsIndex = messageComponents.components.findIndex(button => button.data.custom_id === "logs");
            if (logsIndex !== -1) messageComponents.components.splice(logsIndex, 1);

            // Construct Pagination Buttons
            messageComponents.addComponents(
                ClientButtonsEnum.PREVIOUS_PAGE,
                ClientButtonsEnum.NEXT_PAGE
            );

            // Find the index of the Avatar button, Remove it and add it to the end
            const avatarIndex = messageComponents.components.findIndex(button => button.data.custom_id === "avatar");
            if (avatarIndex !== -1) {
                const avatarButton = messageComponents.components.splice(avatarIndex, 1)[0];
                messageComponents.components.push(avatarButton);
            }

            // Update the interaction components
            await i.update({ components: [messageComponents] })

        }

        /**
         * @selectedButton - Logs
         * Scroll through the log pages
         */
        if (selectedButton === "previous_pg" || selectedButton === "next_pg") {





        }

    })
}