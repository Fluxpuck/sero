const amqp = require('amqplib');
const EVENT_CODES = require('../config/EventCodes');
const eventEnum = require('../config/eventEnum');

// RabbitMQ environment variables
const { RABBIT_HOST, RABBIT_LOCAL, NODE_ENV } = process.env;

async function connectRabbitMQ() {
    try {
        // Connect to RabbitMQ
        const connection = await amqp.connect(
            NODE_ENV === 'production' ? RABBIT_HOST : RABBIT_LOCAL
        );

        // Handle connection errors
        connection.on('error', (err) => {
            console.error('Connection error:', err);
            setTimeout(connectRabbitMQ, 5000); // Attempt to reconnect after 5 seconds
        });

        // Handle connection close
        connection.on('close', () => {
            console.log('Connection closed, retrying...');
            setTimeout(connectRabbitMQ, 5000); // Attempt to reconnect after 5 seconds
        });

        return connection;

    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000); // Attempt to reconnect after 5 seconds
        throw error;
    }
}

async function consumeQueue(client) {
    try {
        const connection = await connectRabbitMQ();
        const channel = await connection.createChannel();
        const queue = 'messages';

        // Consume messages from queue
        await channel.assertQueue(queue, { durable: false });
        channel.consume(queue, (message) => {
            if (message !== null) {
                // Parse the message payload
                const payload = JSON.parse(message.content.toString());

                // Log the message to the console → for debugging purposes only!
                if (NODE_ENV === 'development') {
                    console.log('Received message: ', payload);
                }

                //Emit the client event based on the payload code
                client.emit(payload.code, payload.data);

                // Acknowledge the message
                channel.ack(message);
            }
        }, { noAck: false });

    } catch (error) {
        console.error('Error consuming queue:', error);
        setTimeout(() => consumeQueue(client), 5000); // Attempt to reconnect after 5 seconds
    }
}

module.exports = { consumeQueue };
