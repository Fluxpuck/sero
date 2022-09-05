/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//construct the command and export
module.exports.run = async (client, interaction) => {

    //set timer for interaction reply
    const wait = require('node:timers/promises').setTimeout;
    await wait(800); //wait before giving a reply

    //reply with Discord Latency
    return interaction.editReply(`Pong! → \ ${Math.round(client.ws.ping)}ms`)

}


//command information
module.exports.info = {
    command: {
        name: 'ping',
        category: 'misc',
        desc: 'Checkup on client and Discord latency',
        usage: '/ping'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [], //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
        modal: false,
        permission: [],
        defaultMemberPermissions: ['KickMembers'],
        ephemeral: false
    }
}