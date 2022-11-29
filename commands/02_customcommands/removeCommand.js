/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

//load required modules
const { removeCustomCommandDB } = require("../../database/QueryManager");
const { getCustomCommandFromCache, loadGuildPrefixes } = require("../../utils/CacheManager");
const { deleteGuildCommand } = require("../../utils/ClientManager");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check for command options
    const commandInput = interaction.options.get('command');
    if (commandInput != null) {

        //set command value options (with and without added prefix)
        const commandOptions = [commandInput.value.toLowerCase(), interaction.guild.prefix + commandInput.value.toLowerCase()]

        //get guild's application commands
        await interaction.guild.commands.fetch().then(async applicationcommands => {

            //get slash and custom command from cache
            const customCommand = await getCustomCommandFromCache(interaction.guild, commandOptions[0]) || await getCustomCommandFromCache(interaction.guild, commandOptions[1])
            const selectedCommand = await applicationcommands.find(c => c.name == commandOptions[0]) || await applicationcommands.find(c => c.name == commandOptions[1])

            //if custom command and guild application command are found, remove it
            if (customCommand && selectedCommand) {
                //remove guild application command
                await deleteGuildCommand(interaction.guild, selectedCommand);
                //remove custom command from database
                await removeCustomCommandDB(interaction.guild, selectedCommand.name);
                //update the custom command cache
                await loadGuildPrefixes(interaction.guild);

                //update the interaction guild application command collection, filter out the removed command
                interaction.guild.applicationcommands = applicationcommands.filter(c => c.id != selectedCommand.id);

                //get a random success message
                const { remove_success } = require('../../assets/messages.json');
                let idx = Math.floor(Math.random() * remove_success.length);

                //reply to message
                return interaction.editReply({
                    content: `${remove_success[idx].replace('{command}', `\`/${selectedCommand.name}\``)}`,
                    ephemeral: true
                }).catch((err) => { });

            } else {
                //reply to message
                return interaction.editReply({
                    content: `Hmm... I couldn't find a custom command named \`${userInputCommand}\``,
                    ephemeral: true
                }).catch((err) => { });
            }
        })
    }

    return;

}

//command information
module.exports.info = {
    command: {
        name: 'remove-command',
        category: 'Custom Commands',
        desc: 'Remove a custom command from the server',
        usage: '/remove-command [commandname]'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
            {
                name: 'command',
                type: 3,
                description: 'Choose the command you want to remove',
                required: true
            },
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: true
    }
}