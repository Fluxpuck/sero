/* ===========================================================================
The packages imported below will be used temporarily to test the code, and later moved to commandName.js file. */


// ===========================================================================
module.exports.props = {
    commandName: "test",
    description: "test command",
    usage: "/test [string]",
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
        permissionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandPermissionType  
        options: [
            {
                name: "username",
                type: 3,
                description: "The user that you want to search for.",
                required: true
            }
        ], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
    }

}

module.exports.run = async (client, interaction) => {
    await interaction.reply('Test!');
}