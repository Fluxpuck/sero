const { AuditLogEvent } = require('discord.js');
const { getRequest, postRequest } = require("../database/connection");
const { getAuditLogType } = require('../lib/discord/auditlogevent');
const { unixTimestamp } = require('../lib/helpers/TimeDateHelpers/timeHelper');

module.exports = async (client, unban) => {

    // Get Guild and User from the unban
    const { guild, user } = unban

    try {

        // Fetch the first log based on the unban type and target user
        const auditLog = (await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanRemove, target: user })).entries.first();
        if (!auditLog) return;

        // Fetch the unban log channel from the database
        const banLogChannelResponse = await getRequest(`/guilds/${guild.id}/settings/ban-logs`);
        if (banLogChannelResponse.status !== 200) return;

        // Get channel from request and send message
        const { channelId } = banLogChannelResponse.data;
        const channel = await guild.channels.fetch(channelId);
        if (channel) {

            const content = `<t:${unixTimestamp()}> - **${auditLog.target.username}** was **unbanned** by **${auditLog.executor.username}**`
            const footer = `-# <@${auditLog.targetId}> | ${auditLog.targetId}`

            channel.send({
                content: `${content}\n${footer}`,
            });
        }

        // Store the unban in the database
        const result = await postRequest(`/guilds/${guild.id}/logs`, {
            id: auditLog.id,
            auditAction: auditLog.action,
            auditType: getAuditLogType(auditLog.action),
            targetId: auditLog.targetId,
            reason: auditLog.reason ?? null,
            executorId: auditLog.executorId,
            duration: auditLog.duration ?? null,
        });

        if (result.status !== 200 && result.status !== 201) {
            console.error(`Failed to store unban log in database`, result);
            return;
        }

    } catch (error) {
        console.error(`Error processing unban for user ${user.id}:`, error);
    }
};