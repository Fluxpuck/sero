const { postRequest } = require("../database/connection");
const { getEventName, getEventCategory, checkModerationAction } = require("../lib/discord/auditlogevent");
const { calculateRoundedDuration } = require("../lib/helpers/TimeDateHelpers/timeHelper");

module.exports = async (client, auditLog, guild) => {
    if (!guild.active) return;

    // If the event is a moderation action, save it to the database
    if (checkModerationAction(auditLog.action)) {

        // If the event is a member update, check if it is a timeout
        if (auditLog.action === 24) {
            // Check if the MemberUpdate has to do with a timeout
            const auditLogChanges = auditLog.changes[0];
            if (auditLogChanges.key !== 'communication_disabled_until') return;

            // Check if the timeout is being given or removed
            const isTimeOutGiven = auditLogChanges.new !== undefined
                && auditLogChanges.old === undefined;
            if (!isTimeOutGiven) return;

            // if timeout, calculate the duration
            if (isTimeOutGiven) {
                auditLog.duration = calculateRoundedDuration(auditLogChanges.new);
            }
        }

        //construct audit log object
        const auditLogData = {
            id: auditLog.id,
            auditAction: auditLog.action,
            auditType: getEventName(auditLog.action),
            auditCategory: getEventCategory(auditLog.action),
            targetId: auditLog.targetId,
            reason: auditLog.reason ?? undefined,
            executorId: auditLog.executorId,
            duration: auditLog.duration ?? undefined,
        };

        // Save the audit log to the database
        const request = await postRequest(`/logs/${guild.id}/${auditLog.targetId}`, auditLogData)
        if (request.status !== 200) return console.log(request)

    }
}