/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

// -> Prepare the command parameters
    module.exports.props = {
    commandName: "disconnect",
    description: "Disconnect a user from their voicechannel",
    usage: "/disconnect [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "Select a user to disconnect from a voicechannel",
                type: 6, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType (Type 6 for user)
                required: true // Requires a user to be selected
            }
        ]
    }
};

// → Constructing the command and exporting
module.exports.run = async (client, interaction) => {
    const targetUser = interaction.options.get("user"); // Get the selected user from the interaction
    const targetMember = await interaction.guild.members.fetch(targetUser.value); // Get the member object from the selected user for the current guild (value is the id of the given user)

    if (targetMember.voice.channel) { // Check if the member is in a voicechannel (returns channel or undefined, which is true or false respectively)
        await targetMember.voice.disconnect();
        return interaction.reply({
            content: `Successfully disconnected <@${targetMember.id}> from the voicechannel`, 
            ephemeral: true,
        });
    } else {
        return interaction.reply({ 
            content: `<@${targetMember.id}> is not in a voicechannel`, 
            ephemeral: true });
    }
};
