const { AuditLogEvent, AttachmentBuilder } = require('discord.js');
const { getRequest, postRequest } = require("../database/connection");
const { getAuditLogType } = require('../lib/discord/auditlogevent');
const { unixTimestamp } = require('../lib/helpers/TimeDateHelpers/timeHelper');
const { logEmbed } = require('../assets/embed');
const { differenceInMinutes, getUnixTime } = require('date-fns');
const ClientEmbedColors = require('../assets/embed-colors.js');

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
    if (oldMember.communicationDisabledUntilTimestamp != newMember.communicationDisabledUntilTimestamp) {
        try {

            const auditLogs = await guild.fetchAuditLogs({
                type: AuditLogEvent.MemberUpdate,
                targetId: newMember.id,
                limit: 1
            }).catch(() => null);

            const timeoutLog = auditLogs.entries.first();
            const { changes, target, executor, reason = "", createdAt } = timeoutLog

            const isTimeout = Boolean(newMember.communicationDisabledUntilTimestamp) && changes.includes(changes.find(change => change.key === 'communication_disabled_until'));
            if (!!auditLogs && isTimeout) {

                // Get the moderator who timed out the user
                const executorModerator = (executor && executor?.bot === false) ? `<@${executor.id}>` : '';

                const timeoutDate = new Date(newMember.communicationDisabledUntilTimestamp);
                const timeoutUntil = getUnixTime(timeoutDate);
                const currentTime = getUnixTime(new Date());

                const duration = Math.ceil(differenceInMinutes(timeoutDate, createdAt)) + 1; // Add 1 minute to account for the current minute

                // Construct the message content
                const timeoutMessage = `<t:${currentTime}> - **${target.displayName}** was timed out for ${duration} ${duration == 1 ? "minute" : "minutes"} until <t:${timeoutUntil}> by ${executorModerator}${reason ? ` - \`${reason}\`` : ''}`;
                const timeoutRemovalMessage = `<t:${currentTime}> - **${target.displayName}**'s timeout was removed by ${executorModerator}`;

                const content = isTimeout ? timeoutMessage : timeoutRemovalMessage;
                const footer = `-# <@${oldMember.id}> | ${oldMember.id}`;

                const embedMessage = logEmbed({
                    description: content,
                    footer: footer,
                    color: isTimeout ? ClientEmbedColors.ERROR : ClientEmbedColors.BASE_COLOR
                });

                await logChannel.send({ embeds: [embedMessage] });

                // Store in database, only if the action is a timeout
                if (isTimeout) {
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
                }
            }
        } catch (error) {
            console.error(`Error logging timeout for user ${user.id}:`, error);
        }

    }
};
