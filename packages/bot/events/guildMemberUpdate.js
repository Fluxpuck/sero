const { AuditLogEvent } = require('discord.js');
const { getRequest, postRequest } = require("../database/connection");
const { unixTimestamp } = require('../lib/helpers/TimeDateHelpers/timeHelper');
const { logEmbed } = require('../assets/embed');
const { differenceInMinutes, getUnixTime } = require('date-fns');
const { getGuildActiveStatus } = require('../utils/cache/guild.cache.js');
const ClientEmbedColors = require('../assets/embed-colors.js');

module.exports = async (client, oldMember, newMember) => {

    // Get Guild from the oldMember object
    const { guild, user } = oldMember

    // Check if the guild from the interaction is active
    const isActive = await getGuildActiveStatus(guild.id);
    if (!isActive) return

    // Get the log channel for the guild from the database
    const member_log_channel = await getRequest(`/guilds/${guild.id}/settings/member-logs`);
    if (member_log_channel?.status !== 200) return;

    // Find the log channel in the guild
    const logChannel = await guild.channels.fetch(member_log_channel.data.targetId);
    if (!logChannel) return;


    /**
     * If the user's name has changed, store the change in the user activities and send a message to the member log channel
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
     * If a user is timed out or the timeout is removed, store the action in the user activities and send a message to the member log channel
     */
    if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
        try {
            // Fetch recent audit logs
            const auditLogs = await guild.fetchAuditLogs({
                type: AuditLogEvent.MemberUpdate,
                targetId: newMember.id,
                limit: 1
            }).catch(() => null);

            if (!auditLogs?.entries?.size) return;

            const timeoutLog = auditLogs.entries.first();
            const { changes, target, executor, reason = "", createdAt } = timeoutLog;

            if ((Date.now() - timeoutLog.createdTimestamp) > 3_000) return;

            // Get timeout details
            const timeoutChange = changes.find(change => change.key === 'communication_disabled_until');
            const isTimeout = Boolean(newMember.communicationDisabledUntilTimestamp) && Boolean(timeoutChange);

            // Calculate and validate duration
            const timeoutDate = new Date(newMember.communicationDisabledUntilTimestamp || 0);
            const timeoutUntil = getUnixTime(timeoutDate);
            const currentTime = unixTimestamp();
            const duration = Math.ceil(differenceInMinutes(timeoutDate, createdAt) + 1);

            // Validate timeout duration (0-10081 minutes / 1 week)
            if (isTimeout && (duration <= 0 || duration > 10081)) {
                console.error(`Invalid timeout duration (${duration} minutes) for user ${oldMember.id}`);
                return;
            }

            const executorName = executor?.bot ? 'System' : `<@${executor.id}> (${executor.tag})`;

            // Create log message
            const content = isTimeout
                ? `<t:${currentTime}> - **${target.displayName}** was timed out for ${duration} ${duration === 1 ? "minute" : "minutes"} until <t:${timeoutUntil}> by ${executorName}${reason ? ` - \`${reason}\`` : ''}`
                : `<t:${currentTime}> - **${target.displayName}**'s timeout was removed by ${executorName}`;

            const footer = `-# <@${oldMember.id}> | ${oldMember.id}`;

            // Send log message
            const embedMessage = logEmbed({
                description: content,
                footer: footer,
                color: isTimeout ? ClientEmbedColors.ERROR : ClientEmbedColors.SUCCESS
            });

            await logChannel.send({ embeds: [embedMessage] });

            // Store timeout in database
            if (isTimeout) {
                const result = await postRequest(`/guilds/${guild.id}/logs`, {
                    id: timeoutLog.id,
                    auditAction: timeoutLog.action,
                    auditType: 'MemberTimeout',
                    targetId: newMember.id,
                    executorId: executor?.id || null,
                    duration: Math.min(Math.max(0, duration), 10081), // Extra safety check
                    reason: reason || null
                });

                if (result.status !== 200 && result.status !== 201) {
                    console.error('Failed to store timeout log:', result);
                }

                if (process.env.NODE_ENV === 'development') {
                    console.log('\x1b[2m', `[Timeout Event]: ${result?.data?.message}`);
                }
            }

        } catch (error) {
            console.error(`Error processing timeout for user ${oldMember.id}:`, error);
        }
    }
};
