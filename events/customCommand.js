/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This private-event is triggers by an function and processes data to return a  */

module.exports = async (client, interaction) => {

    //get the channel from the guild interaction
    const channel = await interaction.guild.channels.fetch(interaction.channelId);
    if (!channel) return interaction.followUp({
        content: `Oops, Sorry. Couldn't access the channel.`,
        ephemeral: true
    })

    //(if channel was found) delete the interaction
    else interaction.deleteReply();


    channel.send('TESTING MESSAGE!')







    return;
}