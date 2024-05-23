// Send a message to RabbitMQ
// This is an example of how to send a message to RabbitMQ...
// Should be removed later

const { sendToQueue } = require('../database/publisher');
const EVENT_CODES = require('../config/EventCodes');

const event_code = EVENT_CODES.USER_RANK_UPDATE;
const payload = { key: 'value' };
sendToQueue(event_code, payload);
res.send('Message sent to RabbitMQ');