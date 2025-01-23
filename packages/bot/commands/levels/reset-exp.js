const { postRequest } = require("../../database/connection");
const ClientButtonsEnum = require("../../assets/embed-buttons");
const { ActionRowBuilder, ComponentType, MessageFlags } = require("discord.js");
const { deferInteraction, replyInteraction, updateInteraction, followUpInteraction } = require("../../utils/InteractionManager");

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
    await deferInteraction(interaction, false);

    // Get User details from the interaction options
    const targetUser = interaction.options.get("user")?.user

    // if the user is found, reset the experience
    if (targetUser) {
        // Instead of using the reset route in levels...
        // We set the experience to a negative value to reset it
        // This will trigger the updateRank function in the API
        // And will also remove the rank roles from the user
        const result = await postRequest(`/guilds/${interaction.guildId}/levels/exp/${targetUser.id}`, { experience: -10_000_000 })

        // If the request was not successful, return an error
        if (result?.status !== 200) {
            await interaction.deleteReply();
            return followUpInteraction(interaction, {
                content: "Something went wrong while resetting the users experience.",
                flags: MessageFlags.Ephemeral
            });
        } else {
            return replyInteraction(interaction, {
                content: `<@${targetUser.id}>'s experience has been reset!`,
                ephemeral: false
            });
        }
    } else {

        // Prepare the message components - buttons
        const messageComponents = new ActionRowBuilder()
            .addComponents(
                ClientButtonsEnum.YES,
                ClientButtonsEnum.NO
            );

        // Send a reply and ask if the user is sure
        const response = await replyInteraction(interaction, {
            content: "Are you sure you want to reset all experience for all users?\nThis action will also remove any roles associated with current ranks.\n*This action cannot be undone.*",
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
                const result = await postRequest(`/guilds/${interaction.guildId}/levels/reset`);

                // If the request was not successful, return an error
                if (result?.status !== 200) {
                    return updateInteraction(i, {
                        content: "Something went wrong while resetting the experience.",
                        components: [],
                        flags: MessageFlags.Ephemeral
                    });
                } else {

                    // @DISABLED - Due to the high number of users, this will take a long time to process
                    // and will likely time out the request or Rate Limit the bot

                    // // Get the level ranks from the database response
                    // const levelRanks = result.data.levelRanks || [];

                    // // Iterate over the level ranks and remove all users from the roles
                    // for (const rank of levelRanks) {

                    //     // Get the role by roleId
                    //     const targetRole = await interaction.guild.roles.fetch(rank.roleId);

                    //     // Remove all users from the role
                    //     targetRole.members.forEach(async member => {
                    //         await member.roles.remove(targetRole);
                    //     });

                    // }

                    return updateInteraction(i, {
                        content: `Your server's experience has been reset!`,
                        components: [],
                        ephemeral: false
                    });
                }

            }

            /**
             * @selectedButton - No
             * Cancel the experience reset
             */
            if (selectedButton === "no") {
                return updateInteraction(i, {
                    content: "The experience reset has been cancelled.",
                    components: [],
                    flags: MessageFlags.Ephemeral
                });
            }

        });
    }
}