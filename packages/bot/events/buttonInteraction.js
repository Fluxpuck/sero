const { getRequest, postRequest } = require("../database/connection");

module.exports = async (client, interaction) => {

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
            const { eligibleCollection, payload, claimed = true } = interaction.guild?.rewardDrop
            if (!payload) { // Something went wrong, try to delete the message
                try { // Check if the message is still available
                    const fetchedMessage = await interaction.message.fetch();
                    if (fetchedMessage.deletable) await fetchedMessage.delete();
                } catch (err) { }
            }

            // Check if the guild has already claimed the reward
            if (claimed) {
                return interaction.followUp({
                    content: `Sorry, you are just too late. This reward has already been claimed by someone else.`,
                    ephemeral: true
                })
            } else {
                // Set the claimed status to true
                interaction.guild.rewardDrop.claimed = true;
            }

            // Check if the user is eligible to claim the reward
            if (!eligibleCollection.includes(interaction.member.id)) {
                return interaction.followUp({
                    content: `Sorry, you've not been active enough to claim this reward. Try again next time!`,
                    ephemeral: true
                })
            }

            const pastClaimResults = await getRequest(`guilds/${interaction.guildId}/activities/type/claim-exp-reward`);
            if (pastClaimResults.status === 200) {
                const userIdCount = pastClaimResults.data.reduce((acc, activity) => {
                    acc[activity.userId] = (acc[activity.userId] || 0) + 1;
                    return acc;
                }, {});

                if ((userIdCount[interaction.member.id] || 0) >= 5) {
                    return interaction.followUp({
                        content: `Sorry, you've already claimed so many rewards. Try again next time!`,
                        ephemeral: true
                    })
                }
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

                    // Return the message to the user
                    return interaction.followUp({
                        content: `Congratulations <@${interaction.member.id}>! You claimed **${targetAmount}** experience!`,
                        ephemeral: false
                    })

                }
            } catch (error) {
                console.error('Error claiming experience:', error);
            }

            break;
    }
}