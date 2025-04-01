const { MessageFlags } = require('discord.js');
const { getRequest, postRequest } = require("../database/connection");
const { getGuildActiveStatus } = require('../utils/cache/guild.cache');
const { CLAIM_MESSAGES } = require("../assets/reward-messages");

module.exports = async (client, interaction) => {

    // Check if the interaction is valid
    if (!interaction.isButton()) return;

    // Check if the guild from the interaction is active
    const isActive = await getGuildActiveStatus(interaction.guild.id);
    if (!isActive) return;

    /**
     * Check for button interactions
     * And handle them accordingly
     * @ButtonInteractions {Object} 
     */
    switch (interaction.customId) {
        case "claim-exp-reward":

            // Defer the interaction
            await interaction.deferUpdate();

            // Check if the guild has a rewardDrop object
            const { activeMemberCollection, previousClaimedCollection, payload, claimed = true } = interaction.guild?.rewardDrop
            if (!payload) { // Something went wrong, try to delete the message
                try { // Check if the message is still available
                    const fetchedMessage = await interaction.message.fetch();
                    if (fetchedMessage.deletable) await fetchedMessage.delete();
                } catch (err) { }
            }

            // Check if the guild has already claimed the reward
            if (claimed) {
                return interaction.followUp({
                    content: "Wow, not fast enough! Better luck next time.",
                    flags: MessageFlags.Ephemeral
                })
            } else {

                // Check if the user is active enough to claim the reward
                // If the user is not in the collection, return a message
                if (!activeMemberCollection.includes(interaction.member.id)) {
                    return interaction.followUp({
                        content: "You've not been active enough to claim this reward! Try to be more active next time.",
                        flags: MessageFlags.Ephemeral
                    })
                }

                // Check if the user has already claimed plenty rewards
                const userClaimedInfo = previousClaimedCollection.find(item => item.userId === interaction.member.id);
                if (userClaimedInfo?.claimed >= 5) {
                    return interaction.followUp({
                        content: "You can only claim so much... Try again next time!",
                        flags: MessageFlags.Ephemeral
                    })
                }

                // Set the claimed status to true
                interaction.guild.rewardDrop.claimed = true;
            }

            try { // Check if the message is still available
                const fetchedMessage = await interaction.message.fetch();
                if (fetchedMessage.deletable) await fetchedMessage.delete();
            } catch (err) { }

            // Calculate a random targetAmount between a min and max value
            const min = 200, max = 500;
            const targetAmount = Math.floor(Math.random() * (max - min + 1)) + min;

            try {
                // Give the user the experience
                const result = await postRequest(`/guilds/${interaction.guildId}/levels/exp/${interaction.member.id}`, { experience: targetAmount });

                // If the request was successful
                // Return message to the user
                if (result?.status === 200) {

                    const additionalData = {
                        amount: targetAmount,
                        token: payload.token,
                    }

                    if (payload?.executedBy) {
                        additionalData.executedBy = payload.executedBy;
                    }

                    // Create an activity for the user
                    postRequest(`/guilds/${interaction.guildId}/activities`, {
                        userId: interaction.member.id,
                        type: "claim-exp-reward",
                        additional: additionalData
                    });

                    // Get a random message from the CLAIM_MESSAGES array
                    const text_idx = Math.floor(Math.random() * REWARD_MESSAGES.length);
                    const reward_message = CLAIM_MESSAGES[text_idx].replace("{{USER}}", `<@${interaction.member.id}>`).replace("{{AMOUNT}}", targetAmount);

                    // Return the message to the user
                    return interaction.followUp({
                        content: `${reward_message}`,

                    })

                }
            } catch (error) {
                console.error('Error claiming experience:', error);
            }

            break;
        default:
            break;
    }
}