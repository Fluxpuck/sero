const { MessageFlags } = require('discord.js');
const { getRequest } = require("../../database/connection");
const { createRankCard } = require("../../lib/image/rank");
const { deferInteraction, replyInteraction, followUpInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "rank",
    description: "Check the rank of a user.",
    usage: "/rank [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "The user you want to get the rank of",
                required: false,
            },
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
    cooldown: 2 * 60, // 2 minute cooldown
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Get User details from the interaction options
    const targetUser = interaction.options.get("user")?.user || interaction.user;
    if (!targetUser) {
        return await followUpInteraction(interaction, {
            content: "Oops! Something went wrong while trying to fetch the user.",
            flags: MessageFlags.Ephemeral
        });
    }

    // Get the user experience
    const result = await getRequest(`/guilds/${interaction.guildId}/levels/${targetUser.id}`);

    // If status code is 404, return an error saying the user is not ranked yet
    if (result?.status === 404) {
        return await followUpInteraction(interaction, {
            content: `Uh oh! The user ${targetUser.username} has no rank yet!`,
            flags: MessageFlags.Ephemeral
        });
    } else if (result?.status !== 200) { // If the status code is not 200, return an error that something went wrong
        return await followUpInteraction(interaction, {
            content: "Oops! Something went wrong while trying to fetch the rank!",
            flags: MessageFlags.Ephemeral
        });
    }

    // Get request details
    const { level, experience, position, currentLevelExp, nextLevelExp, remainingExp } = result.data;

    // Get the user's rank card
    const rankCard = await createRankCard(
        targetUser.id,
        targetUser.username,
        targetUser.displayAvatarURL({ forceStatic: true, extension: "png", size: 1024 }),
        position,
        experience,
        level,
        currentLevelExp,
        nextLevelExp,
        remainingExp
    );

    // If creating the rank card was successful, return rankcard
    if (rankCard) {
        await replyInteraction(interaction, { files: [rankCard] });
    } else { // Else return an error
        await followUpInteraction(interaction, {
            content: "Oops! Something went wrong creating your rank card!",
            flags: MessageFlags.Ephemeral
        });
    }
}