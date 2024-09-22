const { postRequest } = require("../database/connection");

module.exports = async (client, interaction) => {

    /**
     * Check for button interactions
     * And handle them accordingly
     * @ButtonInteractions {Object} 
     */
    switch (interaction.customId) {
        case "claim-exp-reward":

            // Check if the guild has a rewardDrop object
            const { token, claimed = true } = interaction.guild?.rewardDrop

            // Check if the guild has already claimed the reward
            if (claimed) {
                await interaction.deferUpdate();

                if (!token) { // Something went wrong, try to delete the message
                    try { // Check if the message is still available
                        const fetchedMessage = await interaction.message.fetch();
                        if (fetchedMessage.deletable) await fetchedMessage.delete();
                    } catch (err) { }
                }

                return interaction.followUp({
                    content: `Sorry, you are just too late. This reward has already been claimed by someone else.`,
                    ephemeral: true
                })
            } else {
                // Set the claimed status to true
                interaction.guild.rewardDrop.claimed = true;
            }

            // Defer the interaction
            await interaction.deferUpdate();

            try { // Check if the message is still available
                const fetchedMessage = await interaction.message.fetch();
                if (fetchedMessage.deletable) await fetchedMessage.delete();
            } catch (err) { }

            // Calculate a random targetAmount between a min and max value
            const min = 200, max = 600;
            const targetAmount = Math.floor(Math.random() * (max - min + 1)) + min;

            try {
                // Give the user the experience
                const result = await postRequest(`/guilds/${interaction.guildId}/levels/exp/${interaction.member.id}`, { experience: targetAmount });

                // If the request was successful
                // Return message to the user
                if (result?.status === 200) {

                    // Create an activity for the user
                    postRequest(`/guilds/${interaction.guildId}/activities`, {
                        userId: interaction.member.id,
                        type: "claim-exp-reward",
                        additional: {
                            amount: targetAmount,
                            token: token
                        }
                    });

                    // Return the message to the user
                    return interaction.followUp({
                        content: `Congratulations! You have claimed **${targetAmount}** experience!`,
                        ephemeral: true
                    })

                }
            } catch (error) {
                console.error('Error claiming experience:', error);
            }

            break;
    }
}