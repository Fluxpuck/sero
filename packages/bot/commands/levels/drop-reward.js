const { getRequest } = require("../../database/connection");
const { generateSnowflake } = require("../../lib/discord/snowflake");
const eventEnum = require("../../config/eventEnum");

module.exports.props = {
    commandName: "drop-reward",
    description: "Manually trigger a reward drop",
    usage: "/drop-reward",
    interaction: {},
    defaultMemberPermissions: ['ManageGuild'],
}

module.exports.run = async (client, interaction) => {

    const rewardDropSetting = await getRequest(`/guilds/${interaction.guild.id}/settings/exp-reward-drops`);
    if (rewardDropSetting.status !== 200) {
        return interaction.reply({ content: 'Oops! Could not fetch the reward drop guild settings.', ephemeral: true });
    }

    // Set the guildId, channelId, and token
    const { guildId, channelId } = rewardDropSetting.data;
    const token = generateSnowflake();
    const payload = { guildId, channelId, token };

    try {
        // Emit the guildRewardDrops event
        client.emit(eventEnum.GUILD_REWARD_DROPS, payload)
    } catch (error) {
        return interaction.reply({ content: 'Oops! Could not trigger the reward drop.', ephemeral: true });
    }

    // Reply to the interaction
    interaction.reply({ content: '*Watch out! A reward drop has been triggered!*', ephemeral: true });

}