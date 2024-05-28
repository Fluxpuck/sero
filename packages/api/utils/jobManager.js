var cron = require('node-cron');
const { publishMessage, REDIS_CHANNELS } = require('../database/publisher');


/**
 * Send a heartbeat message to the Redis channel
 * @schedule - every 1 minutes
 */
cron.schedule('* * * * * ', () => {
    publishMessage(REDIS_CHANNELS.HEARTBEAT, {});
});