/**
 * Log all Invite events
 * @param {*} client - The Discord client
 * @param {*} auditLog - The audit log entry
 */
async function inviteEvents(client, auditLog) {

    // The extra information here will be the channel.
    const { action, extra: channel, executorId, targetId } = auditLog;





}

module.exports = { inviteEvents };