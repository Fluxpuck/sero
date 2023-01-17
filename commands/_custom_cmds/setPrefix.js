/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
// → Modules, functions and utilities
const { updateGuildPrefix } = require("../../database/QueryManager");
const { loadGuildPrefixes, getCustomCommands } = require("../../utils/CacheManager");
const { addCustomCommand, removeGuildCommands } = require("../../utils/ClientManager");
const { charIsLetter } = require("../../utils/functions");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check, and set cooldown
    const cooldownKey = `${interaction.guild.id}_${interaction.command.name}`
    //check if guild has cooldown, else setup cooldown
    if (client.cooldowns.has(cooldownKey)) return interaction.editReply({
        content: `Oops... Looks like this interaction is on a cooldown`,
        ephemeral: true
    }).catch((err) => { });
    else client.cooldowns.set(cooldownKey, interaction.command, 900); //15 minutes

    //check for command options
    const commandOptions = interaction.options.get('prefix');
    //set value for input command
    const userInputPrefix = commandOptions.value.toLowerCase();

    //check if prefix contains any special characters
    if (charIsLetter(userInputPrefix) == false) return interaction.editReply({
        content: `Hmm... \`${userInputPrefix}\` is not a valid prefix *(must be a consonant or vowel)*`,
        ephemeral: true
    }).catch((err) => { });

    //update guild prefix database
    await updateGuildPrefix(interaction.guild.id, userInputPrefix);
    //update guild prefix cache
    await loadGuildPrefixes(interaction.guild);
    //remove all commands
    await removeGuildCommands(interaction.guild)

    //fetch all guild application commands
    const customCommands = await getCustomCommands(interaction.guild);

    //setup interaction message
    var updateCounter = 0
    var interactionMessage = interaction.followUp({
        content: `Updating [${updateCounter}/${customCommands.length}] application commands`,
        ephemeral: true,
    })

    //update all guild application commands
    for (let command of customCommands) {
        //add guild application command
        await addCustomCommand(client, interaction.guild, command);

        //update counter
        updateCounter++

        if (updateCounter == customCommands.length) {
            //get a random success message
            const { prefix_success } = require('../../assets/messages.json');
            let idx = Math.floor(Math.random() * prefix_success.length);

            //reply to message
            interaction.editReply({
                content: `${prefix_success[idx].replace('{prefix}', `\`${userInputPrefix}\``)}`,
                ephemeral: true
            }).catch((err) => { });

        } else {
            interactionMessage = interaction.editReply({
                content: `Updating **[${updateCounter}/${customCommands.length}]** application commands...`,
                ephemeral: true,
            })
        }
    }

    //get guild's application commands
    await interaction.guild.commands.fetch().then(async applicationcommands => {
        //add all guild applications to guild collection
        interaction.guild.applicationCommands = applicationcommands;
    })
    return;
}


//command information
module.exports.info = {
    command: {
        name: 'set-prefix',
        category: 'custom commands',
        desc: 'Set or update guild prefix',
        usage: '/set-prefix [prefix]'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
            {
                name: 'prefix',
                type: 3,
                description: 'Choose preferred prefix for the custom commands',
                minLength: 1,
                maxLength: 1,
                required: true
            },
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: true
    }
}