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
        return replyInteraction(interaction, {
            embeds: [createCustomEmbed({
                description: "You can't rob yourself!",
                color: "#ff0000"
            })]
        });
    }

    // Calculate success (20% chance)
    const success = true //Math.random() < 0.20;

    if (!success) {
        return replyInteraction(interaction, {
            embeds: [createCustomEmbed({
                description: `You tried to rob ${targetUser.username} but failed!`,
                color: "#ff0000"
            })]
        });
    }

    try {
        // Attempt the robbery
        const result = await getRequest(`/guilds/${interaction.guildId}/economy/transfer/steal/${targetUser.id}`, {
            targetId: targetUser.id
        });


        console.log(result);


        if (!result.success) {
            return replyInteraction(interaction, {
                embeds: [createCustomEmbed({
                    description: result.message || "Robbery failed!",
                    color: "#ff0000"
                })]
            });
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
