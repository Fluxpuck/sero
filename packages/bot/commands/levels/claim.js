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

    /**
     * @TEMPORARY - Temporary Command
     * Users can claim a one-time experience reward based on their MEE6 levels.
     */

    // This command is only eligable in the SSundee server
    if (interaction.guildId !== "552953312073220096") {
        await interaction.deleteReply();
        return interaction.followUp({
            content: "This command is currently only available in the SSundee server.",
            ephemeral: true
        })
    }

    // Get the experience from MEE6
    const mee6Result = await getMee6Levels(interaction.user.id);
    if (!mee6Result) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: "Oops! You are not eligible for the one-time experience reward due to missing MEE6 data.",
            ephemeral: true
        })
    }

    // Calculate the experience bonus based on the user's MEE6 level/experience
    function bonusXP(xp, lvl) {
        const DEVIDE_BY = 10_000, MAX_BONUS = 100_000;
        let bonusXP = (xp / DEVIDE_BY) * lvl * (Math.log(lvl + 1) * 2);
        if (bonusXP > MAX_BONUS) bonusXP = MAX_BONUS;
        return Math.floor(bonusXP);
    }
    const EXP_BONUS = bonusXP(mee6Result.xp, mee6Result.level);

    // Claim the reward - Database update
    const claimResult = await postRequest(`/guilds/${interaction.guildId}/levels/claim/${interaction.user.id}`, { experience: EXP_BONUS });

    // If the request was not successful, return an (error) message
    if (claimResult?.status === 404) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: "You do not have a level in the guild.",
            ephemeral: true
        })
    } else if (claimResult?.status === 204) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: "You have already claimed your one-time experience reward.",
            ephemeral: true
        })
    } else if (claimResult?.status !== 200) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: "Uh oh! Something went wrong claiming the experience reward.",
            ephemeral: true
        })
    } else {
        return interaction.editReply({
            content: `You have claimed your one-time experience reward! 🎁 \n You have been awarded **${EXP_BONUS}** experience points.`,
            ephemeral: false
        })
    }
}