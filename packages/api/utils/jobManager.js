var cron = require('node-cron'); // https://www.npmjs.com/package/node-cron
const { publishMessage, REDIS_CHANNELS } = require('../database/publisher');

/**
 * Send a heartbeat message to the Redis channel
 * @schedule - every second
 */
cron.schedule('* * * * * *', () => {
    publishMessage(REDIS_CHANNELS.HEARTBEAT, {});
});