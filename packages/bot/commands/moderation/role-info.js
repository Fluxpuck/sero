const { createCustomEmbed } = require("../../assets/embed")
const { normalizeText } = require('../../lib/helpers/StringHelpers/StringHelper');

module.exports.props = {
    commandName: "role-info",
    description: "Get info on a role",
    usage: "/role-info [role]",
    interaction: {
        type: 1,
        permissionType: [],
        options: [
            {
                name: "role",
                type: 8,
                description: "Role to get information about",
                required: true
            }
        ],
    },
    defaultMemberPermissions: ['KickMembers'],
}

// → Constructing the command and exporting
module.exports.run = async (client, interaction) => {
    // Get details from the interaction options
    const targetRole = interaction.options.get("role").role;

    // Map the role permissions to an array of strings
    const rolePermissions = targetRole.permissions.toArray().join(', ')
        || "This role has no permissions";

    // Get relevant role information
    const { id, name, members, position, icon, hexColor } = targetRole;
    const guildRoles = interaction.guild.roles.cache;

    // Create a new embed
    const messageEmbed = createCustomEmbed({
        title: `${name}`,
        description: `<@&${id}> | ${id}`,
        thumbnail: icon,
        fields: [
            {
                name: "Color:",
                value: hexColor.toString().toUpperCase(),
                inline: true
            },
            {
                name: "Position:",
                value: `Role ${position} of ${guildRoles.size}`,
                inline: true
            },
            {
                name: "Membercount:",
                value: `${members.size} member${members.size === 1 ? '' : 's'}`,
                inline: true
            },
            {
                name: "Permissions:",
                value: rolePermissions.toString(),
                inline: false
            },
        ],
    });

    // Send the embed
    return interaction.reply({
        embeds: [messageEmbed],
        ephemeral: false,
    });

}