/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//load required modules
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

//construct the command and export
module.exports.run = async (client, interaction) => {

    //create custom command Modal Input Field
    const modal = new ModalBuilder()
        .setCustomId('customCommand')
        .setTitle(`Setup a new Custom Command`)
        .addComponents([
            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                    .setCustomId('ccName')
                    .setLabel('Command name')
                    .setPlaceholder('Choose a command name...')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(2)
                    .setMaxLength(12)),

            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                    .setCustomId('ccDesc')
                    .setLabel('Description')
                    .setPlaceholder('Write a description...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMinLength(10)
                    .setMaxLength(500)),

            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                    .setCustomId('ccImage')
                    .setLabel('Image')
                    .setPlaceholder('Put an image link here...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
                    .setMinLength(10)
                    .setMaxLength(100)),
        ])

    //show modal to user
    await interaction.showModal(modal);






    const modalSubmitInteraction = await interaction.awaitModalSubmit({
        filter: (i) => {




            console.log(i.fields);




            return true;
        }, time: 120000,
    })





    modalSubmitInteraction.reply({
        content: `Thank you for reporting`,
        ephemeral: true,
    });




}

//command information
module.exports.info = {
    command: {
        name: 'createcommand',
        category: 'Custom Commands',
        desc: 'Create a new custom command',
        usage: '/createcommand'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [], //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
        modal: true,
        permission: [],
        defaultMemberPermissions: ['KickMembers'],
        ephemeral: true
    }
}