const amqp = require('amqplib');

// RabbitMQ environment variables
const { RABBIT_HOST, RABBIT_LOCAL, NODE_ENV } = process.env;

async function consumeQueue() {
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

            // EXECUTE CODE HERE...

        }, { noAck: true });
    } catch (error) {
        console.error('Error consuming queue:', error);
    }
}

module.exports = { consumeQueue };
