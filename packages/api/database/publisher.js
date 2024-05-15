const amqp = require('amqplib');
const EVENT_CODES = require('../config/EventCodes');

// RabbitMQ environment variables
const { NODE_ENV, RABBIT_HOST, RABBIT_LOCAL } = process.env;

async function sendToQueue(event_code = EVENT_CODES.UNKNOWN, data) {
    try {
        // Connect to RabbitMQ
        const connection = await amqp.connect(
            NODE_ENV === 'production' ? RABBIT_HOST : RABBIT_LOCAL
        );

        // Create a channel && queue
        const channel = await connection.createChannel();
        const queue = 'messages';

        // Construct message payload
        const payload = {
            code: event_code,
            data: data,
            timestamp: new Date()
        };

        // Send message to queue
        await channel.assertQueue(queue, { durable: false });
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));

        // Log the message to the console → for debugging purposes only!
        if (process.env.NODE_ENV === "development") {
            console.log("Message sent: ", payload);
        }

        // Close the channel && connection
        await channel.close();
        await connection.close();

    } catch (error) {
        console.error('Error sending message:', error);
    }
}

module.exports = { sendToQueue };
