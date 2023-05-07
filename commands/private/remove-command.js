/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

// → Importing necessary modules, functions and classes

// → Constructing the command and exporting
module.exports.run = async (client, interaction) => {





    return;
}


// → Exporting the command details
const path = require('path');
// Load the commands from the config file
try {
    applicationChoices = require('../../assets/help-commands.json');
} catch (error) {
    applicationChoices = []
}
module.exports.details = {
    name: 'remove-command',
    directory: path.relative(path.resolve(__dirname, '..'), __dirname),
    description: 'Remove a command from the bot',
    usage: '/remove-command [command]',
    private: true,
    cooldown: 0,
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
        options:
            [
                {
                    name: 'command',
                    type: 3, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
                    description: 'The command to get information about',
                    choices: applicationChoices,
                    required: false
                }
            ],

        permissionType: [],
        optionType: [],
        ephemeral: false,
        modal: false,
        defaultMemberPermissions: []
    }
}