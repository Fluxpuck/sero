const amqp = require('amqplib');

// RabbitMQ environment variables
const { RABBIT_HOST, RABBIT_LOCAL, NODE_ENV } = process.env;

// Setup Connection and Channel variables
let connection, channel;

async function createConnection() {
    try {
        if (!connection || !channel) {
            connection = await amqp.connect(NODE_ENV === 'production' ? RABBIT_HOST : RABBIT_LOCAL, { heartbeat: 30 });

            connection.on('error', (err) => {
                console.error('Connection error:', err);
                reconnect();
            });

            connection.on('close', () => {
                console.log('Connection closed, retrying...');
                reconnect();
            });

            channel = await connection.createChannel();
            await channel.assertQueue('messages', { durable: false });
            console.log('Connection and channel established.');
        }

    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        reconnect();
    }
}

function reconnect() {
    setTimeout(createConnection, 5000); // Retry after 5 seconds
}

async function consumeQueue(client) {
    try {
        if (!connection || !channel) {
            console.error('No connection or channel available');
            await createConnection(); // Ensure connection is re-established
        }

        await channel.consume('messages', (message) => {
            if (message !== null) {
                const payload = JSON.parse(message.content.toString());

                if (NODE_ENV === 'development') {
                    console.log('Received message: ', payload);
                }

                client.emit(payload.code, payload.data);
                channel.ack(message);
            }
        }, { noAck: false });

        console.log('Waiting for messages in queue.');

    } catch (error) {
        console.error('Error consuming queue:', error);
        setTimeout(() => consumeQueue(client), 5000); // Retry after 5 seconds
    }
}

module.exports = { consumeQueue };

createConnection(); // Establish connection