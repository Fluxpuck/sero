const amqp = require('amqplib');

// RabbitMQ environment variables
const { NODE_ENV, RABBIT_HOST, RABBIT_LOCAL } = process.env;

async function sendToQueue(message) {
    try {
        const connection = await amqp.connect(
            NODE_ENV === 'production' ? RABBIT_HOST : RABBIT_LOCAL
        );
        const channel = await connection.createChannel();
        const queue = 'messages';

        await channel.assertQueue(queue, { durable: false });
        await channel.sendToQueue(queue, Buffer.from(message));

        console.log(`Message sent: ${message}`);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

module.exports = { sendToQueue };
