const { ActionRowBuilder, ComponentType } = require("discord.js");
const ClientButtonsEnum = require("../../assets/embed-buttons");
const { createCustomEmbed } = require("../../assets/embed");
const { chunk } = require("../../lib/helpers/MathHelpers/arrayHelper");
const { getRequest } = require("../../database/connection");
const { findUser } = require("../../lib/resolvers/userResolver");
const { deferInteraction, replyInteraction, updateInteraction, followUpInteraction } = require("../../utils/InteractionManager");

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
    defaultMemberPermissions: ['ManageMessages'],
};

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Get User details from the interaction options
    const targetUser = interaction.options.get("user")?.user;
    if (!targetUser) {
        await replyInteraction(interaction, {
            content: "User does not exist.",
            ephemeral: true
        });
        return;
    }

    // Get the user guild details
    const guildUser = findUser(interaction.guild, targetUser.id);

    let userFields = [], userDescription = "";
    if (!guildUser) {
        // Check if the user is banned and add the status to the fields
        const bannedUser = await interaction.guild.bans.fetch(targetUser.id).catch(() => null);
        userDescription = bannedUser
            ? `<@${targetUser.id}> is banned from the server for
            > ${bannedUser.reason || 'No reason provided'}`
            : `<@${targetUser.id}> is not in the server.`

    } else {
        // Add member details
        userFields.push(
            {
                name: "Joined:",
                value: `${guildUser.joinedAt.toUTCString()}`,
                inline: true
            },
            {
                name: "Created:",
                value: `${targetUser.createdAt.toUTCString()}`,
                inline: true
            },
            {
                name: "Highest Role:",
                value: `<@&${guildUser.roles.highest.id}>`,
                inline: true
            },
        )
    }

    // Create and send message Embed
    const messageEmbed = createCustomEmbed({
        title: `Member Information`,
        description: userDescription ? userDescription : `User Information and Logs for <@${targetUser.id}>`,
        thumbnail: targetUser.displayAvatarURL({ dynamic: true }),
        fields: userFields,
        footer: { text: `${targetUser.tag} | ${targetUser.id}` }
    });

    // Fetch the user Activities
    // const userActivityData = await getRequest(`/guilds/${interaction.guildId}/activities/user/${targetUser.id}`);
    // let userActivities = userActivityData.status == 200 ? userActivityData.data : [];

    // Fetch the Audit Logs for the user
    const userLogData = await getRequest(`/guilds/${interaction.guildId}/logs/${targetUser.id}`);
    let userLogs = userLogData.status == 200 ? userLogData.data : [];

    // Setup the Logs Button || Disable if no logs
    const userLogButton = ClientButtonsEnum.LOGS;
    userLogButton.data.label = `${userLogs.length} ${userLogs.length === 1 ? "Log" : "Logs"}`;
    userLogButton.data.disabled = userLogs.length <= 0;

    const avatarButton = ClientButtonsEnum.AVATAR;
    avatarButton.data.disabled = false;

    // Construct message components
    const messageButtons = new ActionRowBuilder()
    messageButtons.addComponents(avatarButton, userLogButton)

    // Return the message
    const returnMessageEmbed = await replyInteraction(interaction, {
        embeds: [messageEmbed],
        components: [messageButtons],
        ephemeral: false
    });


    // Setup the log fields
    const logFields = userLogs.map((log, index) => ({
        name: `(${index + 1}) - ${log.id}`,
        value: `
**Type** - ${log.auditType} ${log.duration ? `/ ${log.duration} minutes` : ''}
**Reason** - ${log.reason || "No reason provided."}
**Executor** - <@${log.executorId}> | ${log.executorId}
**Created** - ${new Date(log.createdAt).toUTCString()}`,
        inline: false
    }));

    // Slice the logs in chunks of 3
    const descriptionPages = chunk(logFields, 3);
    let page = 0, maxpages = descriptionPages.length - 1;

    // Check if there are more than 3 logs
    const logCount = userLogs.length;
    const remainingLogs = userLogs.length - 3;


    // Collect the button selection
    const options = { componentType: ComponentType.Button, idle: 300_000, time: 3_600_000 }
    const collector = returnMessageEmbed.createMessageComponentCollector({ options });
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

            // Find and disable the Avatar button
            const avatarIndex = messageButtons.components.findIndex(button => button.data.custom_id === "avatar");
            messageButtons.components[avatarIndex].data.disabled = true;

            // Update the interaction, disabling the Avatar button
            await updateInteraction(i, { components: [messageButtons] })

            // Send the avatar embed
            await followUpInteraction(i, { embeds: [avatarEmbed] })

        }


        /**
         * @selectedButton - Logs
         * Update the embed and add the logs
         */
        if (selectedButton === "logs") {

            // Find and remove the logs button
            const logsIndex = messageButtons.components.findIndex(button => button.data.custom_id === "logs");
            if (remainingLogs > 0) {
                if (logsIndex !== -1) messageButtons.components.splice(logsIndex, 1);

                // Add Pagination Buttons
                messageButtons.addComponents(
                    ClientButtonsEnum.PREVIOUS_PAGE,
                    ClientButtonsEnum.NEXT_PAGE
                );
            } else {
                if (logsIndex !== -1) messageButtons.components[logsIndex].data.disabled = true;
            }

            // Add logs to embed Fields
            messageEmbed.addFields(
                { name: '\u200B', value: `**${logCount} User ${logCount === 1 ? "Log" : "Logs"}:**` },
                ...descriptionPages[page]);

            if (remainingLogs > 0) {
                messageEmbed.setFooter({
                    text: `page ${page + 1} of ${maxpages + 1} | ${targetUser.id}`
                });
            }

            // Update the interaction components
            await updateInteraction(i, {
                embeds: [messageEmbed],
                components: [messageButtons]
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
            const previousIndex = messageButtons.components.findIndex(button => button.data.custom_id === "previous_pg");
            const nextIndex = messageButtons.components.findIndex(button => button.data.custom_id === "next_pg");
            switch (page) {
                case 0:
                    messageButtons.components[nextIndex].data.disabled = false;
                    messageButtons.components[previousIndex].data.disabled = true;
                    break;
                case maxpages:
                    messageButtons.components[nextIndex].data.disabled = true;
                    messageButtons.components[previousIndex].data.disabled = false;
                    break;
                default:
                    messageButtons.components[nextIndex].data.disabled = false;
                    messageButtons.components[previousIndex].data.disabled = false;
            }

            // Update embed Footer && Fields
            messageEmbed.setFooter({ text: `page ${page + 1} of ${maxpages + 1} | ${targetUser.id}` });
            messageEmbed.data.fields = []; // Empty current fields
            messageEmbed.setFields(
                [
                    ...userFields,
                    { name: '\u200B', value: `**${logCount} User ${logCount === 1 ? "Log" : "Logs"}:**` },
                    ...descriptionPages[page]
                ]
            );

            // Update the interaction components
            await updateInteraction(i, {
                embeds: [messageEmbed],
                components: [messageButtons]
            })

        }
    })

}