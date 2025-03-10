const { getRequest } = require("../../database/connection");
const { createCustomEmbed } = require("../../assets/embed");
const { deferInteraction, replyInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "rob",
    description: "Try to steal money from another user (20% success rate)",
    usage: "/rob [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to rob",
                required: true
            }
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    // Get target user from the interaction options
    const targetUser = interaction.options.getUser("user");

    // Prevent self-robbery
    if (targetUser.id === interaction.user.id) {
        const messageEmbed = createCustomEmbed()
            .setDescription("You can't rob yourself!")
            .setColor("#ff0000");
        return replyInteraction(interaction, { embeds: [messageEmbed] });
    }

    // Calculate success (20% chance)
    const success = Math.random() < 0.20;

    if (!success) {
        const messageEmbed = createCustomEmbed()
            .setDescription(`You tried to rob ${targetUser.username} but failed!`)
            .setColor("#ff0000");
        return replyInteraction(interaction, { embeds: [messageEmbed] });
    }

    try {
        // Attempt the robbery
        const result = await getRequest(`/guilds/${interaction.guildId}/economy/steal/${interaction.user.id}`, {
            targetId: targetUser.id
        });

        if (!result.success) {
            const messageEmbed = createCustomEmbed()
                .setDescription(result.message || "Robbery failed!")
                .setColor("#ff0000");
            return replyInteraction(interaction, { embeds: [messageEmbed] });
        }

        const messageEmbed = createCustomEmbed()
            .setTitle("🦹 Successful Robbery!")
            .setDescription(`You successfully robbed ${targetUser.username} and got away with ${result.stolen} coins!`)
            .addFields(
                { name: "Your New Balance", value: `${result.stealerNewBalance} coins`, inline: true },
                { name: `${targetUser.username}'s New Balance`, value: `${result.targetNewBalance} coins`, inline: true }
            )
            .setColor("#00ff00");

        return replyInteraction(interaction, { embeds: [messageEmbed] });

    } catch (error) {
        const messageEmbed = createCustomEmbed()
            .setDescription("Something went wrong with the robbery!")
            .setColor("#ff0000");
        return replyInteraction(interaction, { embeds: [messageEmbed] });
    }
}
