import { Message } from 'discord.js';

interface MessageContext {
    role: 'user' | 'assistant';
    content: any;
    timestamp: number;
}

class ContextManager {
    private conversations: Map<string, MessageContext[]>;
    private readonly maxContextLength: number;
    private readonly contextTimeoutMs: number;

    constructor(maxContextLength = 10, contextTimeoutMinutes = 30) {
        this.conversations = new Map();
        this.maxContextLength = maxContextLength;
        this.contextTimeoutMs = contextTimeoutMinutes * 60 * 1000;
    }

    private getConversationKey(message: Message): string {
        return `${message.channelId}-${message.author.id}`;
    }

    addMessage(message: Message, content: any, role: 'user' | 'assistant'): void {
        const key = this.getConversationKey(message);
        const context = this.conversations.get(key) || [];

        // Clean expired messages
        const now = Date.now();
        const validMessages = context.filter(msg =>
            (now - msg.timestamp) < this.contextTimeoutMs
        );

        // Add new message
        validMessages.push({
            role,
            content,
            timestamp: now
        });

        // Keep only the most recent messages up to maxContextLength
        if (validMessages.length > this.maxContextLength) {
            validMessages.splice(0, validMessages.length - this.maxContextLength);
        }

        this.conversations.set(key, validMessages);
    }

    getContext(message: Message): any[] {
        const key = this.getConversationKey(message);
        const context = this.conversations.get(key) || [];

        // Clean expired messages when retrieving context
        const now = Date.now();
        const validMessages = context.filter(msg =>
            (now - msg.timestamp) < this.contextTimeoutMs
        );

        if (validMessages.length !== context.length) {
            this.conversations.set(key, validMessages);
        }

        return validMessages.map(({ role, content }) => ({ role, content }));
    }
}

export const contextManager = new ContextManager();