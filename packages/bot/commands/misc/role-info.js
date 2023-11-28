/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */
// → Importing necessary structures
const { EmbedBuilder, CommandInteraction } = require("discord.js")
module.exports.props = {
    commandName: "role-info",
    description: "Get info on a role.",
    usage: "/role-info [role]",
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
        permissionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandPermissionType  
        options: [
            {
                name: "role",
                type: 8,
                description: "The role that you wish to get information on.",
                required: true
            }
        ], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
    }

}

 // → Constructing the command and exporting
module.exports.run = async (client, interaction) => {
    
    // Grab the API role ID, then convert into an actual role object.
    const APIRole = interaction.options.get("role").role.id;
    const role = interaction.guild.roles.cache.find((role) => role.id === APIRole);
    
    /** Makes an array with the following permissions in Bits
     * Administrator,
     * UseSoundboard,
     * ManageMessages,
     * ModerateMembers,
     * UseEmbeddedActivities
     */
    const permissionsArray = [
        'Administrator',
        'UseSoundboard',
        'ManageMessages',
        'ModerateMembers',
        'UseEmbeddedActivities'
    ]
    // → Turn role permissions into an array, filter permissions to get the permissions listed above.
    const rolePermissions = role.permissions.toArray();
    const extractedPerms = rolePermissions
    .filter((permission) => permissionsArray.includes(permission))
    .map((permission) => `${normalizeText(permission)}`)
    if(!extractedPerms) {
        "This role has no permissions."
    }

    
    // → Fetch desired role information
    const role_colour = role.hexColor;
    const role_id = role.id
    const role_members = role.members.size;
    const role_permission = `${role.position}/`;
    const role_name = role.name;
    const role_mention =  `<@&${role_id}>`
    // → Build embed fields:
    const embed_fields = [
        {
            name: `Members in Role:`,
            value: `${role_members}`,
        },
        {
            name: "Hex Color",
            value: `${role_colour}`
        },
        {
            name: `Role ID:`,
            value: `${role_id}`,
        },
        {
            name: `Role Mention:`,
            value: `${role_mention}`
        }, 
        {
            name: "Role Permissions:",
            value: `${extractedPerms}`,
        }, 
    ]
    // Construct the Embed
    const embed = new EmbedBuilder()
    .setTitle(`${role_name} | ${role.position}/${interaction.guild.roles.cache.size}`)
    .setColor(role_colour)
    .addFields(...embed_fields)
    .setFooter({ text: `${interaction.user.username}` })
    .setTimestamp()
    interaction.reply({ embeds: [embed] })
}

function normalizeText (text) {
    return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
}