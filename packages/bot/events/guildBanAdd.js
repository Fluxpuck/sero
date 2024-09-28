const { AuditLogEvent } = require('discord.js');
const { getRequest, postRequest } = require("../database/connection");
const { getAuditLogType, getEventCategory } = require('../lib/discord/auditlogevent');
const { unixTimestamp } = require('../lib/helpers/TimeDateHelpers/timeHelper');

module.exports = async (client, ban) => {

    // Get Guild and User from the ban
    const { guild, user } = ban

    // Fetch the first log based on the ban type
    const auditLog = (await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd, target: user })).entries.first();
    if (!auditLog) return;

    /**
     * @description - Log the ban to a logging channel
     */
    try {
        const ban_log_channel = await getRequest(`/guilds/${guild.id}/settings/ban-log-channel`);
        if (ban_log_channel.status === 200) {

            // Get channel from request and send message
            const { channelId } = ban_log_channel.data
            const channel = await guild.channels.fetch(channelId);
            if (channel) {
                channel.send({
                    content: `<t:${unixTimestamp()}> - <@${auditLog.targetId}> got **banned** from the server by **${auditLog.executor.username}**`,
                });
            }

        }
    } catch (error) {
        console.log(error)
    }

    /**
     * @description - Store the ban in the database
     */
    try {

        await postRequest(`/logs/${guild.id}/${auditLog.targetId}`, {
            id: auditLog.id,
            auditAction: auditLog.action,
            auditType: getAuditLogType(auditLog.action),
            auditCategory: getEventCategory(auditLog.action),
            targetId: auditLog.targetId,
            reason: auditLog.reason ?? null,
            executorId: auditLog.executorId,
            duration: auditLog.duration ?? null,
        });

    } catch (error) {
        console.log(error)
    }

};