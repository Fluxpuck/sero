const { postRequest, getRequest } = require("../../database/connection");

module.exports.props = {
    commandName: "transfer-exp",
    description: "Transfer experience to another user",
    usage: "/transfer-exp [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to transfer experience to",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of experience to transfer to the user",
                required: true,
                minValue: 10,
                maxValue: 1000,
            },
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
    cooldown: 2 * 60, // 2 minute cooldown
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const transferAmount = interaction.options.get("amount").value;

    // Set the transfer XP Limit
    const TRANSFER_AMOUNT_LIMIT = 1_000;
    const TRANSFER_TARGET_LIMIT = 5

    // Check if the user is trying to transfer experience to themselves
    if (interaction.user.id === targetUser.id) {
        return interaction.editReply({
            content: "You can't transfer experience to yourself!",
            ephemeral: true
        })
    }

    // Fetch user transfer activities from today
    const userActivities = await getRequest(`/guilds/${interaction.guildId}/activities/${interaction.user.id}/transfer-exp`);

    // If either request was not successful, return an error
    if (userActivities.status === 200) {

        // Get the activities and total amount of experience transferred
        const activities = userActivities.data;

        // Calculate the total amount of experience transferred today
        let totalAmount = 0;
        for (const activity of activities) {
            const { amount } = activity.additional;
            totalAmount += amount;
        }

        // Check if the totalAmount + the transferAmount combined is higher than the limit
        if (totalAmount + transferAmount > TRANSFER_AMOUNT_LIMIT) {
            const remainingExp = TRANSFER_AMOUNT_LIMIT - totalAmount;
            const transferLimitMessage = remainingExp > 0 ?
                `Uh oh! Your request is exceeding your daily transfer limit! You can only transfer **${remainingExp}** more experience points today.`
                : "You have reached the maximum transfer limit for today!";

            await interaction.deleteReply();
            return interaction.followUp({
                content: `${transferLimitMessage}`,
                ephemeral: true
            });
        }

        // Check if the user has reached the maximum amount of transfers
        if (activities.length >= TRANSFER_TARGET_LIMIT) {
            await interaction.deleteReply();
            return interaction.followUp({
                content: `You have reached your daily transfer limit! You can only transfer to ${TRANSFER_TARGET_LIMIT} users per day.`,
                ephemeral: true
            });
        }

        try {

            // Remove exp from the author
            const removeResult = await postRequest(`/guilds/${interaction.guildId}/levels/exp/${interaction.user.id}`, { experience: -transferAmount });
            if (removeResult.status !== 200) {
                throw new Error("Something went wrong while removing experience from your account.");
            }

            // Add exp to the target
            const addResult = await postRequest(`/guilds/${interaction.guildId}/levels/exp/${targetUser.id}`, { experience: transferAmount });
            if (addResult.status !== 200) {
                throw new Error(`Something went wrong while adding experience to the target user.`);
            }

        } catch (error) {
            await interaction.deleteReply();
            return interaction.followUp({
                content: "Something went wrong while transferring experience to the user.",
                ephemeral: true
            })
        }

        // Store the transfer activity in the database
        postRequest(`/guilds/${interaction.guild.id}/activities`, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            type: "transfer-exp",
            additional: {
                targetId: targetUser.id,
                amount: transferAmount,
            }
        });

        // reply to the user
        return interaction.editReply({
            content: `<@${targetUser.id}> has recieved **${transferAmount}** of your experience!`,
            ephemeral: false
        })

    } else {
        await interaction.deleteReply();
        interaction.followUp({
            content: "Something went wrong while transferring experience to the user.",
            ephemeral: true
        })
    }

} 