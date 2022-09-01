/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This private-event is triggers by an function and processes data to return a  */

//get functions from Managers
const { getCommandFromCache, loadCommandCache } = require("../utils/CacheManager");

//require discord functions
const { EmbedBuilder } = require("discord.js");
//import styling from assets
const embed = require('../assets/embed.json');

module.exports = async (client, interaction) => {

    //get command details
    const commandDetails = await getCommandFromCache(interaction.guild, interaction.commandName)
    if (!commandDetails) {
        //reload cache...
        loadCommandCache(interaction.guild);
        //return error message
        return interaction.followUp({
            content: `Oops, Sorry. Couldn't get the command from cache.`,
            ephemeral: true
        }).catch(err => { });
    }

    //get the channel from the guild interaction
    const channel = await interaction.guild.channels.fetch(interaction.channelId);
    if (!channel) return interaction.followUp({
        content: `Oops, Sorry. Couldn't access the channel.`,
        ephemeral: true
    }).catch(err => { });

    //(if channel was found) delete the interaction
    else interaction.deleteReply().catch(err => { });

    //get values from command details
    let { commandName, commandResponse, commandImage, cooldown } = commandDetails

    //check, and set cooldown
    const cooldownKey = `${interaction.user.id}_${commandName}`
    //check if author has cooldown, else setup cooldown
    if (client.cooldowns.has(cooldownKey)) return;
    else client.cooldowns.set(cooldownKey, commandDetails, cooldown);

    //get mention detail, if available
    const mentionMember = interaction.options.get('user');
    if (!mentionMember) return;

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

    //construct embedded message
    const messageEmbed = new EmbedBuilder()
        .setColor(embed.color)
        .setDescription(commandResponse)

    //check if image is available
    if (commandImage) messageEmbed.setImage(commandImage)

    //reply to message
    return channel.send({
        embeds: [messageEmbed],
        ephemeral: false
    }).catch((err) => { });

}