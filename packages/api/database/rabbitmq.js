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


// Function to publish message to RabbitMQ
async function publishToRabbitMQ(channelName, message, data) {
    try {

        // Validate queue-name against the enum list
        if (!Object.values(ChannelNames).includes(channelName)) {
            throw new Error(`Invalid queue name: '${channelName}'`);
        }

        // Establish RabbitMQ connection && create channel
        const rabbitMQConnection = new RabbitMQConnection();
        const connection = await rabbitMQConnection.connect();
        const channel = await connection.createChannel();

        // Ensure queue for messages
        await channel.assertExchange(channelName, 'direct', { durable: false });

        // Construct message payload
        const payload = {
            message: message,
            data: data,
            timestamp: new Date()
        };

        // Send message to RabbitMQ
        await channel.publish(channelName, '', Buffer.from(JSON.stringify(payload)));

        // Log message to console if in development mode
        if (NODE_ENV === 'development') {
            console.log('Message sent to RabbitMQ:', payload);
        }

    } catch (error) {
        console.error('Error publishing message to RabbitMQ:', error);
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
    publishToRabbitMQ,
    checkRabbitMQConnection,
    ChannelNames
};
