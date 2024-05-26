const Redis = require('ioredis');

// Retry connection settings
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;
let retryCount = 0;

// Define Redis channels
const REDIS_CHANNELS = {
    HEARTBEAT: 'heartbeat',
    RANK: 'guildMemberRank',
};

const createRedisClient = () => {
    // Create a new Redis connection
    const client = new Redis({
        host: process.env.NODE_ENV === 'production' ? process.env.REDIS_HOST : process.env.LOCAL_REDIS_HOST,
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

        // Log the connection status
        if (process.env.NODE_ENV === "development") {
            console.log('Subscriber connected to Redis!');
        }
    });

    return client;
};

// Create a Redis client
const redisClient = createRedisClient();

// Subscribe to a channel and handle incoming messages
const subscribeToChannel = (client) => {

    // Subscribe to all channels from the REDIS_CHANNELS object
    Object.values(REDIS_CHANNELS).forEach(channel => {
        redisClient.subscribe(channel, (err, count) => {
            if (err) {
                console.error('Error subscribing to channel', err);
            } else {
                // Log the message to the console → for debugging purposes only!
                if (process.env.NODE_ENV === "development") {
                    console.log(`Subscribed to ${channel}`);
                }
            }
        });
    });

    // Listen for incoming messages
    // When a message is received, parse and emit a Discord client-event
    redisClient.on('message', (channel, message) => {

        // Parse the message payload
        const payload = JSON.parse(message);

        // Log the message to the console → for debugging purposes only!
        if (process.env.NODE_ENV === "development") {
            console.log(`Received message from ${channel}:`);
            console.log(payload)
        }

        // Emit the Discord client event
        client.emit(payload.code, payload.data);
    });
};




// Export the module
module.exports = { redisClient, subscribeToChannel, REDIS_CHANNELS };