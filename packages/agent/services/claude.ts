import Anthropic from '@anthropic-ai/sdk';

interface User {
    userId: string;
    username: string;
}

interface Guild {
    guildId: string;
    guildName: string | null;
}

interface Channel {
    channelId: string;
    channelName: string;
}


// Define an interface for the context
interface UserContext {
    user: User;
    conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>;
}

// Store user contexts in memory (consider using a database for persistence)
const userContexts = new Map<string, UserContext>();

const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

// Initialize the client with your API key
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function askClaude(guild: Guild, channel: Channel, user: User, prompt: string): Promise<string> {
    try {
        // Get or initialize user context
        if (!userContexts.has(user.userId)) {
            userContexts.set(user.userId, {
                user,
                conversationHistory: []
            });
        }

        const userContext = userContexts.get(user.userId)!;

        // Add the new message to conversation history
        userContext.conversationHistory.push({ role: 'user', content: prompt });

        // Keep only last 10 messages for context (adjust as needed)
        if (userContext.conversationHistory.length > 10) {
            userContext.conversationHistory = userContext.conversationHistory.slice(-10);
        }

        const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 250,
            system: `You are Sero, a friendly and knowledgeable Discord assistant powered by Claude AI.
                    Your primary role is to help manage and enhance the Discord server experience.
                    Core traits:
                    - You are helpful but maintain appropriate boundaries
                    - You communicate in a clear, friendly manner
                    - You're knowledgeable about Discord, gaming, and technology
                    - You can be witty but always stay professional
                    - You prioritize server safety and following Discord guidelines
                    
                    Your current channel is ${channel.channelName} in the server ${guild.guildName}. 
                    You are currently talking to ${user.username}. Use their conversation history for context.
                    
                    Important: Never pretend to be a human. You should always be clear that you are an AI assistant.
                    If you're unsure about something, say so rather than making assumptions.`,
            messages: userContext.conversationHistory,
        });

        const textBlock = response.content.find(block => block.type === 'text');

        if (textBlock && 'text' in textBlock) {
            // Store assistant's response in context
            userContext.conversationHistory.push({
                role: 'assistant',
                content: textBlock.text
            });
            return textBlock.text;
        } else {
            return "No text response received";
        }
    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw error;
    }
}
