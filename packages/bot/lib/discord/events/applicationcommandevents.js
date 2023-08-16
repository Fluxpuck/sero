/**
 * Log all Application command events
 * @param {*} client - The Discord client
 * @param {*} auditLog - The audit log entry
 */
async function applicationCommandEvents(client, auditLog) {

    // The extra information here will be the channel.
    const { action, extra: channel, executorId, targetId } = auditLog;





}

module.exports = { applicationCommandEvents };