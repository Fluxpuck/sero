const amqp = require('amqplib');

// RabbitMQ environment variables
const { NODE_ENV, RABBIT_HOST, RABBIT_LOCAL } = process.env;

// Setup Connection and Channel variables
let connection, channel;

async function createConnection() {
    try {
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

    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        reconnect();
    }
}

function reconnect() {
    setTimeout(async () => {
        await createConnection();
    }, 5000); // Retry after 5 seconds
}

async function sendToQueue(event_code, data) {
    try {
        if (!connection || !channel) {
            console.error('No connection or channel available');
            await createConnection(); // Ensure connection is re-established
        }

        const payload = {
            code: event_code,
            data: data,
            timestamp: new Date()
        };

        await channel.sendToQueue('messages', Buffer.from(JSON.stringify(payload)));

        if (process.env.NODE_ENV === "development") {
            console.log("Message sent: ", payload);
        }

    } catch (error) {
        console.error('Error sending message:', error);
        if (error.isOperational) {
            console.log('Reconnecting and retrying...');
            await createConnection();
            await sendToQueue(event_code, data); // Retry the message sending
        }
    }
}

createConnection(); // Establish connection

module.exports = { sendToQueue };