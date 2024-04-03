const amqp = require('amqplib');

// RabbitMQ environment variables
const { RABBIT_HOST, RABBIT_LOCAL } = process.env;
// General environment variables
const { NODE_ENV } = process.env;

// Define an enum for allowed queue names
const ChannelNames = {
    GUILD_QUEUE: 'guild_queue',
    USER_QUEUE: 'user_queue',
};

class RabbitMQConnection {
    constructor() {
        // Ensure only one instance of RabbitMQConnection exists
        if (!RabbitMQConnection.instance) {
            this.connection = null;
            RabbitMQConnection.instance = this;
        }
        return RabbitMQConnection.instance;
    }

    // Method to establish connection to RabbitMQ
    async connect() {
        try {
            // If connection doesn't exist, create a new one
            if (!this.connection) {
                this.connection = await amqp.connect(
                    NODE_ENV === 'production' ? RABBIT_HOST : RABBIT_LOCAL
                );
            }
            // Return the existing or newly created connection
            return this.connection;
        } catch (error) {
            throw new Error(`Error connecting to RabbitMQ: ${error.message}`);
        }
    }
}

// Function to consume messages from RabbitMQ
async function consumeFromRabbitMQ(queueName, callback) {
    try {
        // Establish RabbitMQ connection && create channel
        const rabbitMQConnection = new RabbitMQConnection();
        const connection = await rabbitMQConnection.connect();
        const channel = await connection.createChannel();

        // Ensure queue for messages
        await channel.assertQueue(queueName, { durable: false });

        // Consume messages from the queue
        channel.consume(queueName, async (message) => {
            if (message !== null) {
                // Parse the message
                const content = JSON.parse(message.content.toString());

                // Process the message
                await callback(content);

                // Acknowledge message processing
                channel.ack(message);
            }
        });

        console.log(`Consuming messages from queue: ${queueName}`);
    } catch (error) {
        console.error('Error consuming messages from RabbitMQ:', error);
    }
}

// Function to check RabbitMQ connection status
async function checkRabbitMQConnection() {
    try {
        // Attempt to establish RabbitMQ connection
        const rabbitMQConnection = new RabbitMQConnection();
        await rabbitMQConnection.connect().catch(error => {
            throw new Error(`Error connecting to RabbitMQ: ${error.message}`);
        });

        // Return true if connection is successful
        return true;
    } catch (error) {
        console.error('Error checking RabbitMQ connection:', error);
        return false;
    }
}

module.exports = {
    consumeFromRabbitMQ,
    checkRabbitMQConnection,
    ChannelNames
};
