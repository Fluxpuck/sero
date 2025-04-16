import NodeCache from 'node-cache';

// Initialize cache with a default TTL of 10 minutes (600 seconds)
const messageHistory = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const MAX_CONTEXT_MESSAGES = 25;

export function createConversationKey(channelId: string, userId: string): string {
    return `${channelId}_${userId}`;
}

export function getConversationHistory(key: string): any[] {
    return messageHistory.get(key) || [];
}

export function updateConversationHistory(key: string, messages: any[]): void {
    if (messages.length > MAX_CONTEXT_MESSAGES * 2) {
        messages = messages.slice(-MAX_CONTEXT_MESSAGES * 2);
    }
    messageHistory.set(key, messages);
}

export function deleteConverstationHistory(key: string): void {
    messageHistory.del(key);
}
