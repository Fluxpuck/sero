const { MessageFlags } = require('discord.js');
const { postRequest } = require("../../database/connection");
const { deferInteraction, replyInteraction, followUpInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "remove-exp",
    description: "Remove experience from a user",
    usage: "/remove-exp [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to remove experience from",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of experience to remove from the user",
                required: true,
                minValue: 1,
                maxValue: 1000000,
            },
        ],
    },
    defaultMemberPermissions: ['ManageGuild'],
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const targetAmount = interaction.options.get("amount").value || 0;

    // Remove the user's experience if has proper amount.
    const result = await postRequest(`/guilds/${interaction.guildId}/levels/exp/${targetUser.id}`, { experience: -targetAmount });

    // If the request was not successful, return an error
    if (result && result?.status !== 200) {
        await interaction.deleteReply();
        await followUpInteraction(interaction, {
            content: `Uh oh! Something went wrong while removing experience from <@${targetUser.id}>.`,
            flags: MessageFlags.Ephemeral
        });

    } else {
        await replyInteraction(interaction, {
            content: `**${targetAmount}** experience was removed from <@${targetUser.id}>!`,
            ephemeral: false
        });
    }
}
