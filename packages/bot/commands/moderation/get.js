const { ActionRowBuilder, ComponentType } = require("discord.js");
const { createCustomEmbed } = require("../../assets/embed");
const { getRequest } = require("../../database/connection");
const { chunk } = require("../../lib/helpers/MathHelpers/arrayHelper");
const ClientButtonsEnum = require("../../assets/embed-buttons");
const { getAuditActionName } = require("../../lib/discord/auditlogevent");

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
    })

    // Setup the log fields
    const logFields = sortLogs.map(log => {
        // Set the log title and value
        const logTitle = `Log: ${log.id}`
        const logValue = `
**Type** - ${getAuditActionName(log.auditAction)} ${log.duration ? ` / ${log.duration} minutes` : ""}
**Reason** - ${log.reason ? log.reason : "No reason provided."}
**Executor** - <@${log.executorId}> | ${log.executorId}
**Created** - ${new Date(log.createdAt).toUTCString()}
        `
        return {
            name: logTitle,
            value: logValue,
            inline: false
        };
    });

    // Slice the logs in chunks of 3
    const descriptionPages = chunk(logFields, 3);
    let page = 0, maxpages = descriptionPages.length - 1;

    // Check if there are more than 3 logs
    const logCount = AuditLogs.length;
    const remainingLogs = AuditLogs.length - 3;
    const hasLogs = AuditLogs.length > 0;

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
            {
                name: "Highest Role:",
                value: `<@&${member.roles.highest.id}>`,
                inline: true
            },
            ...(descriptionPages.length > 0 ? descriptionPages[page] : [])
        ],
        footer: {
            text: remainingLogs > 0
                ? `${remainingLogs} more log${remainingLogs > 1 ? "s" : ""}...`
                : hasLogs
                    ? `These are all ${logCount} log${logCount !== 1 ? "s" : ""}...`
                    : "This user has no logs..."
        }
    })

    // Construct message components
    const logsButton = AuditLogs.length > 3 ? [ClientButtonsEnum.LOGS] : [];
    const messageComponents = new ActionRowBuilder()
        .addComponents(
            ...logsButton,
            ClientButtonsEnum.AVATAR
        );

    // Make sure to RESET the disabled state of the buttons
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
         * Update the embed to show the logs
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

            // Update embed Footer && Fields
            messageEmbed.setFooter({ text: `Log page ${page + 1} of ${maxpages + 1}` })

            // Update the interaction components
            await i.update({
                embeds: [messageEmbed],
                components: [messageComponents]
            })

        }

        /**
         * @selectedButton - Pagination
         * Scroll through the log pages
         */
        if (selectedButton === "previous_pg" || selectedButton === "next_pg") {

            // Update the page number based on the button pressed
            if (selectedButton == 'previous_pg') (page <= 0) ? 0 : page--
            if (selectedButton == 'next_pg') (page >= maxpages) ? maxpages : page++

            // Update the button status, based on the page number
            const previousIndex = messageComponents.components.findIndex(button => button.data.custom_id === "previous_pg");
            const nextIndex = messageComponents.components.findIndex(button => button.data.custom_id === "next_pg");
            switch (page) {
                case 0:
                    messageComponents.components[nextIndex].data.disabled = false;
                    messageComponents.components[previousIndex].data.disabled = true;
                    break;
                case maxpages:
                    messageComponents.components[nextIndex].data.disabled = true;
                    messageComponents.components[previousIndex].data.disabled = false;
                    break;
                default:
                    messageComponents.components[nextIndex].data.disabled = false;
                    messageComponents.components[previousIndex].data.disabled = false;
            }

            // Update embed Footer && Fields
            messageEmbed.setFooter({ text: `Log page ${page + 1} of ${maxpages + 1}` });
            messageEmbed.data.fields = []; // Empty current fields
            messageEmbed.setFields(
                [
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
                    {
                        name: "Highest Role:",
                        value: `<@&${member.roles.highest.id}>`,
                        inline: true
                    },
                    ...descriptionPages[page]
                ]
            );

            // Update the interaction components
            await i.update({
                embeds: [messageEmbed],
                components: [messageComponents]
            })

        }
    })
}