const amqp = require('amqplib');
const EVENT_CODES = require('../config/EventCodes');
const eventEnum = require('../config/eventEnum');

// RabbitMQ environment variables
const { RABBIT_HOST, RABBIT_LOCAL, NODE_ENV } = process.env;

async function consumeQueue(client) {
    try {
        // Connect to RabbitMQ
        const connection = await amqp.connect(
            NODE_ENV === 'production' ? RABBIT_HOST : RABBIT_LOCAL
        );

        // Create a channel && queue
        const channel = await connection.createChannel();
        const queue = 'messages';

        // Consume messages from queue
        await channel.assertQueue(queue, { durable: false });
        channel.consume(queue, (message) => {

            // Parse the message payload
            const payload = JSON.parse(message.content.toString());

            // Log the message to the console → for debugging purposes only!
            if (process.env.NODE_ENV === "development") {
                console.log("Received message: ", payload);
            }

            // Execute the correct event
            // based on the event code
            switch (payload.code) {
                case EVENT_CODES.USER_RANK_UPDATE:
                    // Set the data from the payload
                    // and emit the event to the client
                    const { data } = payload;
                    return client.emit(eventEnum.GUILD_MEMBER_RANK, data);
            }

            return;

        }, { noAck: true });
    } catch (error) {
        console.error('Error consuming queue:', error);
    }
}

module.exports = { consumeQueue };
