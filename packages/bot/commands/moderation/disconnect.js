/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

// → Constructing the command and exporting
module.exports.run = async (client, interaction) => {


    // @to-do
    // Get the target user from the interaction
    // if the target user is currently not in a voicechannel return a (error)messagae
    // if the target user is in a voicechannel, disconnect them from the voicechannel (and maybe return a success message).

}


// → Exporting the command details
const path = require('path');
module.exports.details = {
    name: 'disconnect',
    directory: path.relative(path.resolve(__dirname, '..'), __dirname),
    description: 'Disconnect a user from a voicechannel',
    usage: '/disconnect [voicechannel]',
    private: false,
    cooldown: 0,
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType (Type 1 for slash commands, although this is the default value)
        options:
            [
                {
                    name: 'User',
                    type: 6, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType (Type 6 for user)
                    description: 'Select a user to disconnect from a voicechannel',
                    required: true
                }
            ],
        permissionType: [],
        optionType: [],
        ephemeral: false,
        modal: false,
        defaultMemberPermissions: []
    }
}