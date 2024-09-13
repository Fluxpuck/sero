const { postRequest } = require("../database/connection");

module.exports = async (client, interaction) => {

    /**
     * Check for button interactions
     * And handle them accordingly
     * @ButtonInteractions {Object} 
     */
    switch (interaction.customId) {
        case "claim-exp-reward":

            // Calculate a random targetAmount between 100 and 1000
            const min = 100, max = 1_000;
            const targetAmount = Math.floor(Math.random() * (max - min + 1)) + min;

            try {
                // Give the user the experience
                const result = await postRequest(`/guilds/${interaction.guildId}/levels/exp/${interaction.member.id}`, { experience: targetAmount });

                // If the request was successful
                // Return message to the user
                if (result?.status === 200) {

                    // Delete the message that the button was associated with
                    await interaction.deferUpdate();

                    try { // Check if the message is still available
                        const fetchedMessage = await interaction.message.fetch();
                        if (fetchedMessage.deletable) await fetchedMessage.delete();
                    } catch (err) { }

                    // Return the message to the user
                    interaction.followUp({
                        content: `Congratulations! You have claimed **${targetAmount}** experience!`,
                        ephemeral: true
                    })

                    postRequest(`/guilds/${interaction.guildId}/activities`, {
                        userId: interaction.member.id,
                        type: "claim-exp-reward",
                        additional: {
                            amount: targetAmount,
                        }
                    });
                }
            } catch (error) {
                console.error('Error claiming experience:', error);
            }

            break;
    }
}