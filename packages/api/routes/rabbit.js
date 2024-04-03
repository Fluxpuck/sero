const express = require('express');
const { sendToQueue } = require('../database/publisher');
const router = express.Router();

/**
 * @router GET api/users/:guildId/:userId
 * @description Get a specific User
 */
router.get("/", async (req, res, next) => {
    try {

        const message = 'Hello from the API!';
        const payload = { key: 'value' };
        sendToQueue(message, payload);
        res.send('Message sent to RabbitMQ');

    } catch (error) {
        next(error);
    }
});

// → Export Router to App
module.exports = router;