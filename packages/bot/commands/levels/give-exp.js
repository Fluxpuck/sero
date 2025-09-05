const { MessageFlags } = require('discord.js');
const { postRequest } = require("../../database/connection");
const { deferInteraction, replyInteraction, followUpInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "give-exp",
    description: "Give experience to a user",
    usage: "/give-exp [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to give experience to",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of experience to give to the user",
                required: true,
                minValue: 1,
                maxValue: 1_000_000,
            },
        ],
    },
    defaultMemberPermissions: ['ManageGuild'],
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const targetAmount = interaction.options.get("amount").value;

    // Give the user the experience
    // Missing Route: API route for giving experience to a user needs to be implemented
    const result = await postRequest(`/guild/${interaction.guildId}/levels/exp/${targetUser.id}`, { experience: targetAmount });

    // If the request was not successful, return an error
    if (result?.status !== 200) {
        return followUpInteraction(interaction, {
            content: `Uh oh! Something went wrong while giving experience to ${targetUser.username}.`,
            flags: MessageFlags.Ephemeral
        });
    } else {
        return replyInteraction(interaction, {
            content: `<@${targetUser.id}> has received **${targetAmount}** experience!`,

        });
    }
}