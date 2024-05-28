const { getRequest, postRequest, getMee6Levels } = require("../../database/connection");

module.exports.props = {
    commandName: "claim-exp",
    description: "One-time experience reward!",
    usage: "/claim-exp",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    /*
    Based on Mee6 levels, calculate the bonus experience to give to the user.
    The bonus experience is calculated by taking the user's current experience and level,
    */

    /**
     * @TEMPORARY - TEMPORARY COMMAND DOWN BELOW
     */
    if (interaction.guildId !== "552953312073220096") {
        await interaction.deleteReply();
        return interaction.followUp({
            content: "This command is currently only available in the SSundee server.",
            ephemeral: true
        })
    }

    try {
        // Get the user experience
        const userLevels = await getRequest(`/levels/${interaction.guildId}/${interaction.user.id}`);
        if (userLevels.status !== 200) {
            throw new Error("You have already claimed your one-time experience reward.");
        }

        // Check if the user has already claimed the reward
        if (userLevels.data.reward_claimed === true) {
            throw new Error("You have already claimed your one-time experience reward.");
        }

        // Get the experience from MEE6
        const mee6Result = await getMee6Levels(interaction.user.id);
        if (!mee6Result) {
            throw new Error("Oops! Sorry, but you are not eligible to claim this reward.");
        }

        // Calculate the experience bonus to give
        function calculateBonusXP(xp, lvl) {
            let bonusXP = (xp / 10_000) * lvl * (Math.log(lvl + 1) * 2);
            if (bonusXP > 100_000) bonusXP = 100_000;
            return Math.floor(bonusXP); // Return the bonusXP as an integer
        }
        const EXP_BONUS = calculateBonusXP(mee6Result.xp, mee6Result.level);

        // Give the user the experience
        const postLevelsResult = await postRequest(`/levels/add/${interaction.guildId}/${interaction.user.id}`, { experience: EXP_BONUS });
        if (postLevelsResult.status !== 200) {
            throw new Error(`Uh oh! The user ${interaction.user.username} has no levels yet.`);
        }

        // Post the reward claim
        const postClaimResult = await postRequest(`/levels/claim_reward/${interaction.guildId}/${interaction.user.id}`);
        if (postClaimResult.status !== 200) {
            throw new Error("Something went wrong while claiming your one-time experience reward.");
        }

        // Return the response
        return interaction.editReply({
            content: `You have claimed your one-time experience reward! You have been awarded **${EXP_BONUS}** experience points.`,
            ephemeral: false
        })

    } catch (error) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: `${error.message}`,
            ephemeral: true
        })
    }

}