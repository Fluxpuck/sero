const { AuditLogEvent } = require('discord.js');
const { getRequest, postRequest } = require("../database/connection");
const { getAuditLogType } = require('../lib/discord/auditlogevent');
const { unixTimestamp } = require('../lib/helpers/TimeDateHelpers/timeHelper');

module.exports = async (client, ban) => {

    // Get Guild and User from the ban
    const { guild, user } = ban

    try {

        // Fetch the first log based on the ban type and target user
        const auditLog = (await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd, target: user })).entries.first();
        if (!auditLog) return;

        // Fetch the ban log channel from the database
        const banLogChannelResponse = await getRequest(`/guilds/${guild.id}/settings/ban-logs`);
        if (banLogChannelResponse.status !== 200) return;

        // Get channel from request and send message
        const { channelId } = banLogChannelResponse.data;
        const channel = await guild.channels.fetch(channelId);
        if (channel) {

            const content = `<t:${unixTimestamp()}> - **${auditLog.target.username}** got **banned** by **${auditLog.executor.username}** for \`${auditLog.reason ?? "No reason provided"}\``
            const footer = `-# <@${auditLog.targetId}> | ${auditLog.targetId}`

            channel.send({
                content: `${content}\n${footer}`,
            });
        }

        // Store the ban in the database
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
            console.error(`Failed to store ban log in database`, result);
            return;
        }

    } catch (error) {
        console.error(`Error processing ban for user ${user.id}:`, error);
    }
};