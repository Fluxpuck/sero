const { MessageFlags } = require('discord.js');
const { deferInteraction, replyInteraction, followUpInteraction } = require("../../utils/InteractionManager");

module.exports.props = {
    commandName: "mass-unban",
    description: "Revoke all bans in the guild",
    usage: "/mass-unban",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, false);

    try {
        // Fetch all bans
        const bans = await interaction.guild.bans.fetch();

        if (bans.size === 0) {
            return replyInteraction(interaction, {
                content: 'There are no banned users in this server',
                flags: MessageFlags.EPHEMERAL
            });
        }

        let successCount = 0;
        let failCount = 0;

        for (const ban of bans.values()) {
            try {
                await interaction.guild.members.unban(ban.user.id);
                successCount++;
            } catch (error) {
                console.error(`Failed to unban ${ban.user.tag}:`, error);
                failCount++;
            }
        }

        await replyInteraction(interaction, {
            content: `Successfully unbanned ${successCount} user${successCount !== 1 ? 's' : ''}.` +
                (failCount > 0 ? ` Failed to unban ${failCount} user${failCount !== 1 ? 's' : ''}.` : ''),
            flags: MessageFlags.EPHEMERAL
        }
        );

    } catch (error) {
        console.error('Error revoking all bans:', error);
        await followUpInteraction(interaction, {
            content: 'An error occurred while trying to unban users',
            flags: MessageFlags.EPHEMER
        });
    }

}