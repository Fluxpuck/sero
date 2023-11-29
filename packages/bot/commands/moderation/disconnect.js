/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

module.exports.props = {
    commandName: "disconnect",
    description: "Disconnect a user from a voicechannel",
    usage: "/disconnect [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user", // REMEMBER: the name cannot have capital letters!
                description: "Select a user to disconnect from a voicechannel",
                type: 6, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType (Type 6 for user)
                required: true,
            }
        ]
    }
};

// → Constructing the command and exporting
module.exports.run = async (client, interaction) => {
    // @to-do
    // Get the target user from the interaction
    // if the target user is currently not in a voicechannel return a (error)messagae
    // if the target user is in a voicechannel, disconnect them from the voicechannel (and maybe return a success message).
    // ALSO check if the user using this command has the perms to disconnect (if applicable)

    // TODO undo the ephermal tag in the reply when the command is finished

    // Extra:
    // Add a reason option to the command interaction options

    const targetUser = await interaction.options.get("user"); // Get the selected user from the interaction
    const targetMember = await interaction.guild.members.fetch(targetUser.value); // Get the member object from the selected user for the current guild (value is the id of the given user)

    console.log(targetMember)
    console.log(targetMember.voice.channel)
    if (targetMember.voice.channel) {
        // Found something about voice.members, perhaps I can check if the user is in said channel? What does voice.channel return?
        // Also found this: https://discord.com/developers/docs/resources/voice
        // Or heck, maybe the voice.disconnect already does this for me, gotta check though...
        targetMember.voice.disconnect();
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
