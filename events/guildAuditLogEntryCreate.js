/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

const { getEventName } = require("../lib/discord/auditlogevent");

// → Importing necessary modules, functions and classes

module.exports = async (client, auditLog) => {

    // The extra information here will be the channel.
    const { action, extra: channel, executorId, targetId } = auditLog;

    console.log(auditLog)

    console.log(getEventName(action), channel, executorId, targetId)

    return;
}