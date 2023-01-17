/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
// → Modules, functions and utilities
const { UpdateGuildApplicationTable } = require("../../database/DbManager");
const { updateGuildApplyId } = require("../../database/QueryManager");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check for selected member
    const applicationChannel = interaction.options.get('channel');

    //remove member from block list
    await updateGuildApplyId(interaction.guild.id, applicationChannel.value);

    //create database table
    await UpdateGuildApplicationTable(interaction.guild.id);

    //return message to user
    return interaction.editReply({
        content: `All applications will be created as threads under <#${applicationChannel.value}>.`,
        ephemeral: true
    })

}


//command information
module.exports.info = {
    command: {
        name: 'set-application',
        category: 'applications',
        desc: 'Will enable the application feature in the current channel.',
        usage: '/set-application'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
            {
                name: 'channel',
                type: 7,
                channelTypes: 0, //channelTypes → https://discord-api-types.dev/api/discord-api-types-v10/enum/ChannelType
                description: 'Choose a channel that will hold all the application threads',
                required: true
            },
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: true
    }
}