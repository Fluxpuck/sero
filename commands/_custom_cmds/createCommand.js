/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
const { filetypes } = require('../../config/config.json');

// → Modules, functions and utilities
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { saveCustomCommandDB, getCustomCommandsDB } = require('../../database/QueryManager');
const { validURL, getUrlFileType, containsSpecialChars, hasWhiteSpace, isLowerCase } = require('../../utils/functions');
const { addCustomCommand } = require('../../utils/ClientManager');
const { loadCustomCommands } = require('../../utils/CacheManager');

//construct the command and export
module.exports.run = async (client, interaction) => {

    //setup status value
    var status = { valid: false, msg: '', details: undefined }

    //create custom command Modal Input Field
    const modal = new ModalBuilder()
        .setCustomId('customCommand')
        .setTitle(`Setup a new Custom Command`)
        .addComponents([
            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                    .setCustomId('ccName')
                    .setLabel('Command name')
                    .setPlaceholder('Choose a command name')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(2)
                    .setMaxLength(12)),

            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                    .setCustomId('ccDesc')
                    .setLabel('Response')
                    .setPlaceholder('What should the custom command say?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMinLength(10)
                    .setMaxLength(500)),

            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                    .setCustomId('ccImage')
                    .setLabel('Image URL')
                    .setPlaceholder('Provide image address, must be .png, .jpg, .jpeg or .gif (optional)')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
                    .setMinLength(10)
                    .setMaxLength(120)),

            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                    .setCustomId('ccCooldown')
                    .setLabel('Cooldown Time')
                    .setPlaceholder('Please put a cooldown time between 1 and 999 seconds')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(3)),
        ])

    //show modal to user
    await interaction.showModal(modal);

    //get modal return
    const modalSubmitInteraction = await interaction.awaitModalSubmit({
        filter: async (i) => {
            //get all submitted answers, by each value
            const ccName = i.fields.fields.get('ccName');
            const ccDesc = i.fields.fields.get('ccDesc');
            const ccImage = i.fields.fields.get('ccImage');
            const ccCooldown = i.fields.fields.get('ccCooldown');

            //setup database structure
            function customCommand(customName, customResponse, customImage, cooldown, role_perms) {
                this.customName = customName;
                this.customResponse = customResponse;
                this.customImage = customImage;
                this.cooldown = cooldown;
                this.role_perms = role_perms;
            }
            //setup command details
            const commandDetails = new customCommand(ccName.value.toLowerCase(), ccDesc.value, (ccImage.value == '') ? null : ccImage.value, ccCooldown.value, null)
            status.valid = true, status.msg = 'Success', status.details = commandDetails

            //validate command name
            if (containsSpecialChars(ccName.value) == true) status.valid = false, status.msg = 'Command name contains special character(s)'
            if (hasWhiteSpace(ccName.value) == true) status.valid = false, status.msg = 'Command name contains space(s)'
            if (isLowerCase(ccName.value) == false) status.valid = false, status.msg = "Command name is not lower case"

            //validate image url
            if (ccImage.value != '') {
                if (!validURL(ccImage.value)) status.valid = false, status.msg = 'Image URL is invalid'
                else if (!filetypes.includes(getUrlFileType(ccImage.value))) status.valid = false, status.msg = 'URL is not a valid image type'
            }

            //validate if command already exist
            const currentCommands = await getCustomCommandsDB(interaction.guild);
            if (currentCommands.map(c => c.commandName).includes(ccName.value)) status.valid = false, status.msg = `A command named \`${ccName.value}\` already exist`
            if (client.commands.map(c => c.info.command.name).includes(ccName.value)) status.valid = false, status.msg = `Sorry, \`${ccName.value}\` can't be choosen, since it's a client-command`

            //check if cooldown is valid number
            if (!isFinite(ccCooldown.value)) status.valid = false, status.msg = `\`${ccCooldown.value}\` is not a valid time`

            //if status is true, save to database
            if (status.valid == true) await saveCustomCommandDB(interaction.guild, commandDetails);

            return true;
        }, time: 120000,
    })

    //send succes or fail message
    if (status.valid == true) {
        //create custom command details
        function customCommand(name, response, image, cooldown, perms) {
            this.commandName = name;
            this.commandResponse = response;
            this.commandImage = image;
            this.commandCooldown = cooldown;
            this.commandPerms = perms
        }
        //setup the command detail structure
        const commandDetails = new customCommand(status.details.customName.toLowerCase(), status.details.customResponse, status.details.customImage, status.details.cooldown, status.details.role_perms)
        await addCustomCommand(client, interaction.guild, commandDetails); //register application

        //update command cache
        await loadCustomCommands(interaction.guild); //update cache

        //get a random success message
        const { create_success } = require('../../assets/messages.json');
        let idx = Math.floor(Math.random() * create_success.length);

        return modalSubmitInteraction.reply({
            content: `${create_success[idx].replace('{command}', `\`/${interaction.guild.prefix}${status.details.customName}\``)}`,
            ephemeral: true,
        });
    }

    if (status.valid == false)
        return modalSubmitInteraction.reply({
            content: `Oops! → ${status.msg}`,
            ephemeral: true,
        });

}

//command information
module.exports.info = {
    command: {
        name: 'create-command',
        category: 'CUSTOMCOMMANDS',
        desc: 'Create and add a new custom command to the server',
        usage: '/create-command'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [], //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
        modal: true,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: true
    }
}