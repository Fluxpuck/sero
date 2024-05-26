const { postRequest } = require("../../database/connection");
const ClientButtonsEnum = require("../../assets/embed-buttons");
const { ActionRowBuilder, ComponentType } = require("discord.js");

module.exports.props = {
    commandName: "reset-exp",
    description: "Reset all experience of a User",
    usage: "/reset-exp [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to reset",
                required: false
            }
        ],
    },
    defaultMemberPermissions: ['ManageGuild'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    // Get User details from the interaction options
    const targetUser = interaction.options.get("user")?.user

    // if the user is found, reset the experience
    if (targetUser) {
        // Reset the user the experience
        const result = await postRequest(`/levels/reset/${interaction.guildId}/${targetUser.id}`);

        // If the request was not successful, return an error
        if (result?.status !== 200) {
            await interaction.deleteReply();
            return interaction.followUp({
                content: "Something went wrong while resetting the users experience.",
                ephemeral: true
            })
        } else {
            return interaction.editReply({
                content: `<@${targetUser.id}>'s experience has been reset!`,
                ephemeral: false
            })
        }
    } else {

        // Prepare the message components - buttons
        const messageComponents = new ActionRowBuilder()
            .addComponents(
                ClientButtonsEnum.YES,
                ClientButtonsEnum.NO
            );

        // Send a reply and ask if the user is sure
        const response = await interaction.editReply({
            content: "Are you sure you want to reset all experience for all users?\n*This action cannot be undone.*",
            components: [messageComponents],
            ephemeral: false
        });

        // Collect the button selection
        const options = { componentType: ComponentType.Button, idle: 300_000, time: 3_600_000 }
        const collector = response.createMessageComponentCollector({ options });
        collector.on('collect', async i => {

            const selectedButton = i.customId;

            /**
             * @selectedButton - Yes
             * Reset all experience for all users
             */
            if (selectedButton === "yes") {

                // Reset the experience for all users in the guild
                const result = await postRequest(`/levels/reset/${interaction.guildId}`);

                // If the request was not successful, return an error
                if (result?.status !== 200) {
                    return i.update({
                        content: "Something went wrong while resetting the experience.",
                        components: [],
                        ephemeral: true
                    })
                } else {
                    return i.update({
                        content: `Your server's experience has been reset!`,
                        components: [],
                        ephemeral: false
                    })
                }

            }

            /**
             * @selectedButton - No
             * Cancel the experience reset
             */
            if (selectedButton === "no") {
                return i.update({
                    content: "The experience reset has been cancelled.",
                    components: [],
                    ephemeral: true
                })
            }

        });
    }
}