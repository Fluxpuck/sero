const { MessageFlags } = require('discord.js');
const { postRequest, getRequest } = require("../../database/connection");
const { deferInteraction, replyInteraction, followUpInteraction } = require("../../utils/InteractionManager");

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
    await deferInteraction(interaction, false);

    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const transferAmount = interaction.options.get("amount").value;

    // Set the transfer XP Limit
    const TRANSFER_AMOUNT_LIMIT = 1_000;
    const TRANSFER_TARGET_LIMIT = 5

    // Check if the user is trying to transfer experience to themselves
    if (interaction.user.id === targetUser.id) {
        return replyInteraction(interaction, {
            content: "You can't transfer experience to yourself!",
            flags: MessageFlags.Ephemeral
        });
    }

    // Fetch user transfer activities from today
    let eligibleForTransfer = false;
    // Missing Route: API route for fetching user transfer activities needs to be implemented
    const userActivities = await getRequest(`/guild/${interaction.guildId}/activities/user/${interaction.user.id}/transfer-exp?today=true`);

    // If there are no activities, the user is eligible for transfer
    if (userActivities.status === 404) {
        eligibleForTransfer = true;
    }

    // If there is activity, check if the user is eligible for transfer
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

            await followUpInteraction(interaction, {
                content: `${transferLimitMessage}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        } else {
            eligibleForTransfer = true;
        }

        // Check if the user has reached the maximum amount of transfers
        if (activities.length >= TRANSFER_TARGET_LIMIT) {
            await followUpInteraction(interaction, {
                content: `You have reached your daily transfer limit! You can only transfer to ${TRANSFER_TARGET_LIMIT} users per day.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        } else {
            eligibleForTransfer = true;
        }

    }


    if (eligibleForTransfer) {
        try {
            // Remove exp from the author
            // Missing Route: API route for removing experience from a user needs to be implemented
            const removeResult = await postRequest(`/guild/${interaction.guildId}/levels/exp/${interaction.user.id}`, { experience: -transferAmount });
            if (removeResult.status !== 200) {
                throw new Error("Something went wrong while removing experience from your account.");
            }

            // Add exp to the target
            // Missing Route: API route for adding experience to a user needs to be implemented
            const addResult = await postRequest(`/guild/${interaction.guildId}/levels/exp/${targetUser.id}`, { experience: transferAmount });
            if (addResult.status !== 200) {
                throw new Error(`Something went wrong while adding experience to the target user.`);
            }

        } catch (error) {
            await followUpInteraction(interaction, {
                content: "Something went wrong while transferring experience to the user.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Store the transfer activity in the database
        // Missing Route: API route for storing activities needs to be implemented
        postRequest(`/guild/${interaction.guildId}/activities`, {
            guildId: interaction.guildId,
            userId: interaction.user.id,
            type: "transfer-exp",
            additional: {
                targetId: targetUser.id,
                amount: transferAmount,
            }
        });

        // reply to the user
        return replyInteraction(interaction, {
            content: `<@${targetUser.id}> has received **${transferAmount}** of your experience!`,

        });

    } else {
        followUpInteraction(interaction, {
            content: "Sorry, you are not eligible to transfer experience. Please try again later.",
            flags: MessageFlags.Ephemeral
        });
    }
}