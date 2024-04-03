const amqp = require('amqplib');

// RabbitMQ environment variables
const { RABBIT_HOST, RABBIT_LOCAL, NODE_ENV } = process.env;

async function consumeQueue() {
    try {
        const connection = await amqp.connect(
            NODE_ENV === 'production' ? RABBIT_HOST : RABBIT_LOCAL
        );
        const channel = await connection.createChannel();
        const queue = 'messages';

        await channel.assertQueue(queue, { durable: false });

        console.log('Waiting for messages...');

        channel.consume(queue, (message) => {
            console.log(`Received message: ${message.content.toString()}`);
        }, { noAck: true });
    } catch (error) {
        console.error('Error consuming queue:', error);
    }
}

module.exports = { consumeQueue };
