var cron = require('node-cron'); // https://www.npmjs.com/package/node-cron
const { publishMessage, REDIS_CHANNELS } = require('../database/publisher');


/**
 * Send a heartbeat message to the Redis channel
 * @schedule - every 15 minutes
 */
cron.schedule('*/15 * * * * ', () => {
    publishMessage(REDIS_CHANNELS.HEARTBEAT, {});
});