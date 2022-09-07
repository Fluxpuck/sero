/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//load in Query
const { removeCustomCommand } = require("../../database/QueryManager");
const { getCommandFromCache } = require("../../utils/CacheManager");
const { delSlashCommand } = require("../../utils/ClientManager");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check for command options
    const commandOptions = interaction.options.get('command');
    if (commandOptions != null) {

        //get guild's application commands
        await interaction.guild.commands.fetch().then(async applicationcommands => {

            //set value for input command
            const userInputCommand = commandOptions.value.toLowerCase();

            //get slash and custom command from cache
            const customCommand = await getCommandFromCache(interaction.guild, userInputCommand)
            const selectedCommand = await applicationcommands.find(c => c.name == userInputCommand)

            //if the user input is a custom command & registered slash command, remove it
            if (customCommand && selectedCommand) {

                //remove custom command application
                delSlashCommand(interaction.guild, selectedCommand);
                //remove custom command from database
                removeCustomCommand(interaction.guild, selectedCommand.name);

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