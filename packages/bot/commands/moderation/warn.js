const { MessageFlags } = require('discord.js');
const { WARN_PREREASONS } = require("../../assets/reason-messages");
const { postRequest } = require("../../database/connection");
const { generateSnowflake } = require("../../lib/discord/snowflake");
const { formatExpression } = require("../../lib/helpers/StringHelpers/stringHelper");
const { deferInteraction, replyInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "warn",
    description: "Send a warning to a user in their DMs",
    usage: "/warn [user] (reason)",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "Select a user to warn",
                type: 6,
                required: true,
            },
            {
                name: "reason",
                description: "Type a reason to warn the user",
                type: 3,
                required: true,
                autocomplete: true,
                maxLength: 250,
            },
        ],
    },
    defaultMemberPermissions: ['ModerateMembers'],
};

module.exports.autocomplete = async (client, interaction) => {
    const focusedReason = interaction.options.getFocused();

    // Get and format the pre-reasons
    const reasons = Object.keys(WARN_PREREASONS).map(reason =>
        ({ name: formatExpression(reason), value: WARN_PREREASONS[reason] })
    );

    // Get the focussed reason && return the filtered reason
    const filteredReasons = reasons.filter(reason => reason.name.toLowerCase().includes(focusedReason.toLowerCase()));
    interaction.respond(filteredReasons);
}


module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, true);

    // Get User details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const reason = interaction.options.get("reason").value;

    // Fetch the user by userId
    const member = await interaction.guild.members.fetch(targetUser.id)

    // If the target is the author, return message
    if (member.user.id === interaction.user.id) return replyInteraction(interaction, {
        content: "You cannot warn yourself!",
        flags: MessageFlags.Ephemeral
    });

    // If the member is not moderatable, return message
    if (!member.moderatable) return replyInteraction(interaction, {
        content: `<@${member.user.id}> is a moderator!`,
        flags: MessageFlags.Ephemeral
    });

    // Create the private warning message
    const privateMessage = `<@${member.user.id}>, you have been warned in **${interaction.guild.name}** for the following reason: ${reason}`;

    // Send the private warning message to the target user
    member.send(privateMessage)
        .then(() => {
            return replyInteraction(interaction, {
                content: `You successfully warned <@${member.user.id}> with the following message:\n> ${privateMessage}`,
                flags: MessageFlags.Ephemeral,
            });
        })
        .catch(err => {
            return replyInteraction(interaction, {
                content: `Could not warn <@${member.user.id}>, but a warning has been logged.`,
                flags: MessageFlags.Ephemeral,
            });
        });

    // Store the warn in the database
    await postRequest(`/guilds/${interaction.guild.id}/logs`, {
        id: generateSnowflake(),
        auditAction: 19,
        auditType: "MemberWarn",
        targetId: targetUser.id,
        reason: reason,
        executorId: interaction.user.id,
        duration: null,
    });
};
