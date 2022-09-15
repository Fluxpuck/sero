/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//load required modules
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { updateCustomCommand, getCustomCommands } = require('../../database/QueryManager');
const { getCommandFromCache } = require('../../utils/CacheManager');
const { validURL, getUrlFileType } = require('../../utils/functions');

//get extention types
const { filetypes } = require('../../config/config.json');
const { updateSlashCustomCommand } = require('../../utils/ClientManager');
const { loadCommandCache } = require('../../utils/CacheManager');

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check for command options
    const commandOptions = interaction.options.get('command');
    if (commandOptions != null) {

        //set value for input command
        const userInputCommand = commandOptions.value.toLowerCase();

        //get guild's application commands
        const applicationCommands = await interaction.guild.commands.fetch();
        //get slash and custom command from cache
        const customCommand = await getCommandFromCache(interaction.guild, userInputCommand)
        const selectedCommand = await applicationCommands.find(c => c.name == userInputCommand)

        //if command could not be found
        if (!customCommand || !selectedCommand) {
            await interaction.deferReply({ ephemeral: true }).catch((err) => { })
            return interaction.editReply({
                content: `Hmm... I couldn't find a custom command named \`${userInputCommand}\``,
                ephemeral: true
            }).catch((err) => { });
        }

        //setup variables
        var { commandName, commandResponse, commandImage, commandCooldown } = customCommand
        //setup status value
        var status = { valid: false, msg: '', details: undefined }

        //build modal componants
        const nameInput = new ActionRowBuilder().setComponents(
            new TextInputBuilder()
                .setCustomId('ccName')
                .setLabel('Command name')
                .setPlaceholder('Choose a command name')
                .setValue(commandName)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(12))

        const responseInput = new ActionRowBuilder().setComponents(
            new TextInputBuilder()
                .setCustomId('ccDesc')
                .setLabel('Response')
                .setPlaceholder('What should the custom command say?')
                .setValue(commandResponse)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(500))

        const imageInput = new ActionRowBuilder().setComponents(
            new TextInputBuilder()
                .setCustomId('ccImage')
                .setLabel('Image URL')
                .setPlaceholder('Provide image address, must be .png, .jpg, .jpeg or .gif (optional)')
                .setValue(commandImage)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setMinLength(10)
                .setMaxLength(120))

        const cooldownInput = new ActionRowBuilder().setComponents(
            new TextInputBuilder()
                .setCustomId('ccCooldown')
                .setLabel('Cooldown Time')
                .setPlaceholder('Please put a cooldown time between 1 and 999 seconds')
                .setValue(commandCooldown.toString())
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(3))

        //create custom command Modal Input Field
        const modal = new ModalBuilder()
            .setCustomId('customCommand')
            .setTitle(`Setup a new Custom Command`)
            .addComponents([
                nameInput, responseInput, imageInput, cooldownInput
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
                const commandDetails = new customCommand(ccName.value, ccDesc.value, (ccImage.value == '') ? null : ccImage.value, ccCooldown.value, null)
                status.valid = true, status.msg = 'Success', status.details = commandDetails

                //validate image
                if (ccImage.value != '') {
                    if (!validURL(ccImage.value)) status.valid = false, status.msg = 'Image URL is invalid'
                    else if (!filetypes.includes(getUrlFileType(ccImage.value))) status.valid = false, status.msg = 'URL is not a valid image type'
                }

                //check if cooldown is valid number
                if (!isFinite(ccCooldown.value)) status.valid = false, status.msg = `\`${ccCooldown.value}\` is not a valid time`

                //if status is true, save to database
                if (status.valid == true) await updateCustomCommand(interaction.guild, commandDetails);

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
            await updateSlashCustomCommand(client, interaction.guild, commandDetails, selectedCommand); //update application

            //update command cache
            await loadCommandCache(interaction.guild);

            //get a random success message
            const { update_success } = require('../../assets/messages.json');
            let idx = Math.floor(Math.random() * update_success.length);

            return modalSubmitInteraction.reply({
                content: `${update_success[idx].replace('{command}', `\`/${interaction.guild.prefix}${status.details.customName}\``)}`,
                ephemeral: true,
            });
        }

        if (status.valid == false)
            return modalSubmitInteraction.reply({
                content: `Oops! ${status.msg}`,
                ephemeral: true,
            });
    }
}

//command information
module.exports.info = {
    command: {
        name: 'update-command',
        category: 'Custom Commands',
        desc: 'Change the details of a custom commands',
        usage: '/update-command'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
            {
                name: 'command',
                type: 3,
                description: 'Choose the command you want to update',
                required: true
            },
        ],
        modal: true,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: true
    }
}