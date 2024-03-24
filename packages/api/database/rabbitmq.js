const amqp = require('amqplib');

// RabbitMQ environment variables
const { RABBIT_HOST, RABBIT_LOCAL } = process.env;
// General environment variables
const { NODE_ENV } = process.env;

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
async function publishToRabbitMQ(message, data) {
    try {
        // Establish RabbitMQ connection
        const rabbitMQConnection = new RabbitMQConnection();
        const connection = await rabbitMQConnection.connect();

        // Create channel
        const channel = await connection.createChannel();
        const queueName = 'sero_message_queue';

        // Ensure queue for messages
        await channel.assertQueue(queueName, { durable: false });

        // Construct message payload
        const payload = {
            message: message,
            data: data
        };

        // Send message to RabbitMQ
        await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)));

        // Log message to console if in development mode
        if (NODE_ENV === 'development') {
            console.log('Message sent to RabbitMQ:', payload);
        }

        // Close channel
        await channel.close();
    } catch (error) {
        // Handle error
        console.error('Error publishing message to RabbitMQ:', error);
        throw error; // Rethrow the error to handle it in the caller function
    }
}

// Function to check RabbitMQ connection status
async function checkRabbitMQConnection() {
    try {
        // Attempt to establish RabbitMQ connection
        const rabbitMQConnection = new RabbitMQConnection();
        const connection = await rabbitMQConnection.connect().catch(error => {
            throw new Error(`Error connecting to RabbitMQ: ${error.message}`);
        });

        // Close the connection (for testing purposes)
        await connection.close();

        // Return true if connection is successful
        return true;
    } catch (error) {
        console.error('Error checking RabbitMQ connection:', error);
        return false;
    }
}

module.exports = {
    publishToRabbitMQ,
    checkRabbitMQConnection
};
