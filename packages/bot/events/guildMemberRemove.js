const { AuditLogEvent } = require('discord.js');
const { getRequest, postRequest } = require("../database/connection");
const { getAuditLogType } = require('../lib/discord/auditlogevent');
const { unixTimestamp } = require('../lib/helpers/TimeDateHelpers/timeHelper');
const { logEmbed } = require('../assets/embed');
const ClientEmbedColors = require('../assets/embed-colors.js');

module.exports = async (client, member) => {

    const { guild } = member;

    // Get the log channel for the guild from the database
    const member_log_channel = await getRequest(`/guilds/${guild.id}/settings/member-logs`);
    if (member_log_channel.status !== 200) return;

    // Find the log channel in the guild
    const logChannel = await guild.channels.fetch(member_log_channel.data.targetId);
    if (!logChannel) return;

    try {

        const auditLogs = await guild.fetchAuditLogs({
            type: AuditLogEvent.MemberKick,
            target: member.user,
            limit: 1
        }).catch(() => null);

        if (!auditLogs?.entries?.size) return;

        const kickLog = auditLogs.entries.first();
        const { target, executor, reason, createdAt } = kickLog;

        if ((Date.now() - kickLog.createdTimestamp) > 10_000) return;

        // Get the moderator who timed out the user
        const executorName = executor?.bot ? 'System' : `<@${executor.id}> (${executor.tag})`;

        const content = `<t:${unixTimestamp(createdAt)}> - **${target.username}** was kicked by **${executorName}**${reason ? ` for \`${reason}\`` : ''}`;
        const footer = `-# <@${target.id}> | ${target.id}`;

        const embedMessage = logEmbed({
            description: content,
            footer: footer,
            color: ClientEmbedColors.WARNING
        });

        await logChannel.send({ embeds: [embedMessage] });

        // Store the kick in the database
        const result = await postRequest(`/guilds/${guild.id}/logs`, {
            id: kickLog.id,
            auditAction: kickLog.action,
            auditType: getAuditLogType(kickLog.action),
            targetId: target.id,
            executorId: executor?.id || null,
            reason: kickLog.reason ?? null,
        });


        if (result.status !== 200 && result.status !== 201) {
            console.error('Failed to store kick log:', result);
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('\x1b[2m', `[Event]: ${result?.data?.message}`);
        }

    } catch (error) {
        console.error(`Error logging kick for user ${member.id}:`, error);
    }
};