const amqp = require('amqplib');

// RabbitMQ environment variables
const { RABBIT_HOST, RABBIT_LOCAL } = process.env;
// General environment variables
const { NODE_ENV } = process.env;

// Define an enum for allowed queue names
const QueueNames = {
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

module.exports = {
    QueueNames
};
