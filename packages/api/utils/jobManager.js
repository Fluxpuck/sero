var cron = require('node-cron');

/**
 * Send a heartbeat to the RabbitMQ server
 * @schedule - every 10 minutes
 */
cron.schedule('*/10 * * * *', () => {

    const { sendToQueue } = require('../database/publisher');
    const EVENT_CODES = require('../config/EventCodes');
    sendToQueue(EVENT_CODES.HEARTBEAT, {});

});




// cron.schedule('*/10 * * * * *', () => {
//     console.log('running every 10 seconds');
// });