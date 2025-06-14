import Redis from 'ioredis';
import { Channel, Payload } from './publisher.types';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const publisher = new Redis(redisUrl);

/**
 * Publisher class for sending messages to a Redis channel
 */
export function publish(channel: Channel, data: any): Promise<number> {
    if (!Object.values(Channel).includes(channel)) {
        // Send Message to Error Channel if channel does not exist
        const payload: Payload = { message: "This channel does not exist", timestamp: new Date() };
        return publisher.publish(Channel.ERROR, JSON.stringify(payload));
    }

    // Publish Message to Channel
    const payload: Payload = { code: channel, message: "Successfully published to channel", data, timestamp: new Date() };
    return publisher.publish(channel, JSON.stringify(payload));
}
