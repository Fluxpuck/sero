var cron = require('node-cron');

/**
 * Send a heartbeat to the RabbitMQ server
 * @schedule - every 1 minutes
 */
cron.schedule('* * * * * ', () => {

    const { sendToQueue } = require('../database/publisher');
    const EVENT_CODES = require('../config/EventCodes');
    sendToQueue(EVENT_CODES.HEARTBEAT, {});

});