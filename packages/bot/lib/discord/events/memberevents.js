const { getRequest } = require("../../../database/connection");
const { getEventName } = require("../auditlogevent");

/**
 * Log all Member events
 * @param {*} client - The Discord client
 * @param {*} auditLog - The audit log entry
 */
async function memberEvents(client, auditLog, guild) {

    // The extra information here will be the channel.
    const { action, extra: channel, executorId, targetId } = auditLog;


    console.log(await getRequest(`/guilds/events/${guild.id}`))


    console.log(getEventName(action))
    // console.log(auditLog)
    console.log('____')



}

module.exports = { memberEvents };