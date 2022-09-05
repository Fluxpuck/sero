/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//import styling from assets
const { ActionRowBuilder } = require('discord.js');
const { BOT_BUTTON } = require('../../assets/buttons');

//construct the command and export
module.exports.run = async (client, interaction) => {

    //construct invite button
    const web_button = new ActionRowBuilder()
        .addComponents(BOT_BUTTON);

    //reply with Discord Latency
    return interaction.editReply({
        content: `Hey, this is **${client.user.username}** bot. I was created to make it easy for you to *create* and *use* __custom commands__ in your server.\nClick the button below to invite me to your server.`,
        components: [web_button]
    })

}


//command information
module.exports.info = {
    command: {
        name: 'invite',
        category: 'misc',
        desc: 'Invite Flux to your own server!',
        usage: '/invite'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [], //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
        modal: false,
        permission: [],
        defaultMemberPermissions: ['SendMessages'],
        ephemeral: true
    }
}