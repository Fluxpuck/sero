/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//load in Query
const { delSlashCommand } = require("../../utils/ClientManager");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check for command options
    const commandOptions = interaction.options.get('command');
    if (commandOptions != null) {

        //get guild's application commands
        await interaction.guild.commands.fetch().then(async applicationcommands => {

            //find the correct slash command
            const selectedCommand = await applicationcommands.find(c => c.name == commandOptions.value.toLowerCase())
            if (selectedCommand) {
                //remove command
                await delSlashCommand(interaction.guild, selectedCommand)
                //reply to message
                return interaction.editReply({
                    content: `\`${selectedCommand.name}\` was removed successfully!`,
                    ephemeral: true
                }).catch((err) => { });
            } else {
                //reply to message
                return interaction.editReply({
                    content: `Couldn't find a command named \`${commandOptions.value}\``,
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
        name: 'removecommand',
        category: 'Custom Commands',
        desc: 'Remove a custom command',
        usage: '/removecommand [commandname]'
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