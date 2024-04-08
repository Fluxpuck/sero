const express = require('express');
const { sendToQueue } = require('../database/publisher');
const router = express.Router();

const EVENT_CODES = require('../config/EventCodes');

/**
 * @router GET api/users/:guildId/:userId
 * @description Get a specific User
 */
router.get("/", async (req, res, next) => {
    try {

        // Send a message to RabbitMQ
        // This is an example of how to send a message to RabbitMQ...
        // Should be removed later

        const event_code = EVENT_CODES.USER_RANK_UPDATE;
        const payload = { key: 'value' };
        sendToQueue(event_code, payload);
        res.send('Message sent to RabbitMQ');

    } catch (error) {
        next(error);
    }
});

// → Export Router to App
module.exports = router;