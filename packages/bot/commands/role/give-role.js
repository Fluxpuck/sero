const { postRequest } = require("../../database/connection");
const { findUser } = require("../../lib/resolvers/userResolver");
const { deferInteraction, replyInteraction, followUpInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "give-role",
    description: "Give a user a temporary role for a specific duration",
    usage: "/give-role [user] [role] (duration)",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "Select a user to give a temporary role to",
                type: 6,
                required: true,
            },
            {
                name: "role",
                description: "Select a role to give to the user",
                type: 8,
                required: true,
            },
            {
                name: "duration",
                type: 10,
                description: "The amount (in hours) of time you want to give the role for",
                required: false,
                minValue: 1,
                maxValue: 168,
            },
        ],
    },
    defaultMemberPermissions: ['ManageGuild', 'ManageRoles'],
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, true);

    // Get the user and role from the interaction
    const targetUser = interaction.options.get("user").user;
    const targetRole = interaction.options.get("role").role;
    const duration = interaction.options.get("duration")?.value;

    const isTemporary = !!duration;

    // Fetch full member details
    const member = findUser(interaction.guild, targetUser.id);
    if (!member) {
        await replyInteraction(interaction, {
            content: "Could not find the user in the guild",
            ephemeral: true
        });
        return;
    }

    // Store the temporary role in the database
    if (isTemporary) {
        const result = await postRequest(`/guilds/${interaction.guildId}/roles/add`, { userId: targetUser.id, roleId: targetRole.id, duration: duration });
        // If the request was not successful, return an error
        if (result?.status !== 201) {
            return await followUpInteraction(interaction, {
                content: "Something went wrong while storing the temporary role",
                ephemeral: true
            });
        }
    }

    // Give the targetRole to the member
    try {
        // Give the user the temporary role
        await member.roles.add(targetRole, `test`)
    } catch (error) {
        return await followUpInteraction(interaction, {
            content: "Something went wrong while gifting the temporary role",
            ephemeral: true
        });
    }

    // Send the success message
    const contentMessage = isTemporary ? `for **${duration}** ${duration > 1 ? "hours" : "hour"}` : "";
    await replyInteraction(interaction, {
        content: `Successfully gave <@${targetUser.id}> the role <@&${targetRole.id}> ${contentMessage}`,
        ephemeral: false
    });
}