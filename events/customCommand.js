/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This private-event is triggers by an function and processes data to return a  */

//get functions from Managers
const { getCustomCommandFromCache, loadCustomCommands } = require("../utils/CacheManager");

//require discord functions
const { EmbedBuilder } = require("discord.js");
//import styling from assets
const embed = require('../assets/embed.json');

module.exports = async (client, interaction) => {

    //check if the bot has access to channel
    if (interaction.channel == null) return interaction.deleteReply().catch(err => { });

    //get command details
    const commandDetails = await getCustomCommandFromCache(interaction.guild, interaction.commandName)
    if (!commandDetails) {
        //reload cache...
        loadCustomCommands(interaction.guild);
        //return error message
        return interaction.followUp({
            content: `Oops, Sorry. Couldn't get the command from cache.`,
            ephemeral: true
        }).catch(err => { });
    }
    //(if channel was found) delete the interaction
    else interaction.deleteReply().catch(err => { });

    //get values from command details
    let { commandName, commandResponse, commandImage, commandCooldown } = commandDetails

    //check, and set cooldown
    const cooldownKey = `${interaction.user.id}_${commandName}`

    //check if author has cooldown, else setup cooldown
    if (client.cooldowns.has(cooldownKey)) return;
    else client.cooldowns.set(cooldownKey, commandDetails, commandCooldown);

    //get mention detail, if available
    const mentionMember = interaction.options.get('user');

    //check for supported Tags
    const supportedTags = ['{author}', '{mention}']
    for await (let tag of supportedTags) {
        //setup replacement
        var replacement = new RegExp(`${tag}`, 'g');
        var match = replacement.exec(commandResponse);
        if (match) { //check if there is a match
            //check if {mention} is present and if the author mentioned an user
            if (match[0] == '{mention}'
                && !mentionMember) return;

            //replace tags from string
            if (match[0] == '{author}') commandResponse = await commandResponse.replace(replacement, `<@${interaction.user.id}>`)
            if (match[0] == '{mention}') commandResponse = await commandResponse.replace(replacement, `<@${mentionMember.member.id}>`)
        }
    }

    //randomly choose one of the pattern colours
    let idx = Math.floor(Math.random() * embed.colourPallet.length);

    //construct embedded message
    const messageEmbed = new EmbedBuilder()
        .setColor(embed.colourPallet[idx])
        .setDescription(commandResponse)

    //check if image is available
    if (commandImage) messageEmbed.setImage(commandImage)

    //reply to message
    return interaction.channel.send({
        embeds: [messageEmbed],
        ephemeral: false
    }).catch((err) => {

        //get a random success message
        const { send_error } = require('../assets/messages.json');
        let idx = Math.floor(Math.random() * send_error.length);

        //if bot does not have 'message send' permissions in the channel, return error message
        if (err.rawError.code = 50001) return interaction.followUp({
            content: `${send_error[idx]}`,
            ephemeral: true
        }).catch(err => { })
        else return;

    });

}