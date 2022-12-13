/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
// → Modules, functions and utilities

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check if channel has thread options available

    console.log(interaction.channel)








    // //send the application message
    // return interaction.channel.send({
    //     content: 'You have ',
    //     ephemeral: false
    // }).catch(err => { });

}


//command information
module.exports.info = {
    command: {
        name: 'set-application',
        category: 'setup',
        desc: 'Will enable the application feature in the current channel.',
        usage: '/set-application'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: true
    }
}