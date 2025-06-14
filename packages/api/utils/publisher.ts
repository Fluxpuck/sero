import Redis from 'ioredis';
import { Channel, Payload } from './publisher.types';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const publisher = new Redis(redisUrl);

/**
 * Publisher class for sending messages to a Redis channel
 */
export function publish(channel: Channel, data: any): Promise<number> {
    const payload: Payload = {
        code: channel,
        data,
        timestamp: new Date()
    }

    return publisher.publish(channel, JSON.stringify(payload));
}
