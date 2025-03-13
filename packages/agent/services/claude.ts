import Anthropic from '@anthropic-ai/sdk';

// Define an interface for the context
interface UserContext {
    userId: string;
    username: string;
    conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>;
}

// Store user contexts in memory (consider using a database for persistence)
const userContexts = new Map<string, UserContext>();

// Initialize the client with your API key
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function askClaude(userId: string, username: string, prompt: string,): Promise<string> {
    try {
        // Get or initialize user context
        if (!userContexts.has(userId)) {
            userContexts.set(userId, {
                userId,
                username,
                conversationHistory: []
            });
        }

        const userContext = userContexts.get(userId)!;

        // Add the new message to conversation history
        userContext.conversationHistory.push({ role: 'user', content: prompt });

        // Keep only last 10 messages for context (adjust as needed)
        if (userContext.conversationHistory.length > 10) {
            userContext.conversationHistory = userContext.conversationHistory.slice(-10);
        }

        const response = await anthropic.messages.create({
            model: 'claude-3-7-sonnet-20250219',
            max_tokens: 250,
            system: `You are Sero, a friendly and knowledgeable Discord assistant powered by Claude AI.
                    Your primary role is to help manage and enhance the Discord server experience.
                    Core traits:
                    - You are helpful but maintain appropriate boundaries
                    - You communicate in a clear, friendly manner
                    - You're knowledgeable about Discord, gaming, and technology
                    - You can be witty but always stay professional
                    - You prioritize server safety and following Discord guidelines
                    
                    You are currently talking to ${username}. Use their conversation history for context.
                    
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
