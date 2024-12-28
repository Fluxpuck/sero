const { AuditLogEvent, AttachmentBuilder } = require('discord.js');
const { getRequest, postRequest } = require("../database/connection");
const { getAuditLogType } = require('../lib/discord/auditlogevent');
const { unixTimestamp } = require('../lib/helpers/TimeDateHelpers/timeHelper');
const { logEmbed } = require('../assets/embed');

module.exports = async (client, oldMember, newMember) => {

    // Get Guild from the oldMember object
    const { guild, user } = oldMember

    // Get the log channel for the guild from the database
    const member_log_channel = await getRequest(`/guilds/${guild.id}/settings/member-logs`);
    if (member_log_channel.status !== 200) return;

    // Find the log channel in the guild
    const logChannel = await guild.channels.fetch(member_log_channel.data.targetId);
    if (!logChannel) return;


    /**
     * If the user's name has changed, store the change in the user activities
     * And send a message to the member log channel
     */
    if (oldMember.displayName !== newMember.displayName
        && oldMember.nickname !== null) {
        try {

            // Construct the message content
            const content = `<t:${unixTimestamp()}> - **${oldMember.displayName}** changed their name to **${newMember.displayName}**`
            const footer = `-# <@${oldMember.id}> | ${oldMember.id}`
            const embedMessage = logEmbed({
                description: content,
                footer: footer
            })

            logChannel.send({ embeds: [embedMessage] });

            // Store the name change in the database
            const result = await postRequest(`/guilds/${guild.id}/activities`, {
                guildId: guild.id,
                userId: oldMember.id,
                type: "update-name",
                additional: {
                    oldName: oldMember.displayName,
                    newName: newMember.displayName,
                }
            });

            if (result.status !== 200 && result.status !== 201) {
                console.error(`Failed to store name change to user activities`, result);
            }

            if (process.env.NODE_ENV === "development") {
                console.log("\x1b[2m", `[Event]: ${result?.data?.message}`);
            }
        } catch (error) {
            console.error(`Error logging name change for user ${user.id}:`, error);
        }
    }


    /**
     * If a user is timed out or the timeout is removed, store the action in the user activities
     * And send a message to the member log channel
     */
    if (oldMember.communicationDisabledUntilTimestamp != newMember.communicationDisabledUntilTimestamp) {
        try {
            // Fetch audit logs
            const auditLogs = await guild.fetchAuditLogs({
                type: AuditLogEvent.MemberUpdate,
                limit: 1
            }).catch(() => null);

            if (!auditLogs) {
                console.error('Failed to fetch audit logs');
                return;
            }
            const timeoutLog = auditLogs.entries.first();
            const moderator = timeoutLog?.executor ? `<@${timeoutLog.executor.id}>` : 'Unknown';

            // Get timeout details
            const isTimeout = Boolean(newMember.communicationDisabledUntilTimestamp);
            const timeoutUntil = Math.floor(newMember.communicationDisabledUntilTimestamp / 1000);
            const currentTime = Math.floor(Date.now() / 1000);
            const duration = isTimeout
                ? Math.floor((newMember.communicationDisabledUntilTimestamp - Date.now()) / (1000 * 60))
                : null;

            // Create log message
            const content = isTimeout
                ? `<t:${currentTime}> - **${newMember.displayName}** was timed out for ${duration} minutes until <t:${timeoutUntil}> by ${moderator}`
                : `<t:${currentTime}> - **${newMember.displayName}**'s timeout was removed by ${moderator}`;
            const footer = `-# <@${oldMember.id}> | ${oldMember.id}`;
            const embedMessage = logEmbed({
                description: content,
                footer: footer,
            });

            await logChannel.send({ embeds: [embedMessage] });

            // Store in database
            const result = await postRequest(`/guilds/${guild.id}/logs`, {
                id: timeoutLog.id,
                auditAction: timeoutLog.action,
                auditType: isTimeout ? 'MemberTimeout' : 'MemberTimeoutRemove',
                targetId: newMember.id,
                executorId: timeoutLog?.executor?.id || null,
                duration: duration,
                reason: timeoutLog?.reason || null
            });

            if (result.status !== 200 && result.status !== 201) {
                console.error('Failed to store timeout log:', result);
            }

            if (process.env.NODE_ENV === 'development') {
                console.log('\x1b[2m', `[Event]: ${result?.data?.message}`);
            }
        } catch (error) {
            console.error(`Error logging timeout for user ${user.id}:`, error);
        }

    }
};
