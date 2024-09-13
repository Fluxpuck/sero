const Redis = require('ioredis');

// Retry connection settings
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;
let retryCount = 0;

// Define Redis channels
const REDIS_CHANNELS = {
    HEARTBEAT: 'heartbeat',
    RANK: 'guildMemberRank',
    ROLE: 'guildMemberRole',
    DROP: 'guildRewardDrops',
};

const createRedisClient = () => {
    // Create a new Redis connection
    const client = new Redis({
        host: process.env.NODE_ENV === 'production' ? process.env.REDIS_HOST : "localhost",
        port: process.env.REDIS_PORT,
        reconnectOnError: (err) => {
            return true; // Retry on every error
        }
    });

    // Handle connection errors
    client.on('error', (err) => {
        // Log the connection Error
        console.error('[Redis Connection]', err);

        // Check if the maximum number of retries has been reached
        // Else retry the connection after a delay
        if (retryCount < MAX_RETRIES) {
            retryCount++;

            // Send console warning message
            console.warn(`Retrying connection in ${RETRY_INTERVAL / 1000} seconds... (Attempt ${retryCount} of ${MAX_RETRIES})`);

            setTimeout(() => {
                client.connect().catch(err => console.error('[Redis Retry]', err));
            }, RETRY_INTERVAL);
        } else {
            console.error('Max retries reached. Could not connect to Redis.');
        }
    });

    // Reset retry count on successful connection
    client.on('connect', () => {
        retryCount = 0;
    });

    return client;
};

// Create a Redis client
const redisClient = createRedisClient();

// Publish a message to a channel
const publishMessage = (event_code = REDIS_CHANNELS.HEARTBEAT, data) => {
    // Construct message payload
    const payload = {
        code: event_code,
        data: data,
        timestamp: new Date().toUTCString()
    };

    // Publish the message to the Redis channel
    // The message is a JSON string
    redisClient.publish(event_code, JSON.stringify(payload), (err, reply) => {
        if (err) {
            console.error('Error publishing message', err);
        } else {
            // Log the message to the console → for debugging purposes only!
            if (process.env.NODE_ENV === "development") {
                if (event_code != REDIS_CHANNELS.HEARTBEAT) {
                    console.log(`Message published to ${event_code}:`);
                    console.log(payload);
                }
            }
        }
    });
};

// Export the module
module.exports = { redisClient, publishMessage, REDIS_CHANNELS };