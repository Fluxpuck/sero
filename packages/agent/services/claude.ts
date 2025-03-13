import Anthropic from '@anthropic-ai/sdk';

// Initialize the client with your API key
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function askClaude(prompt: string): Promise<string> {
    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-7-sonnet-20250219',
            max_tokens: 1000,
            system: 'You are a helpful Discord server assistant. Your purpose is to assist the manager of the Discord server, assist users, and maintain a positive community environment.',
            messages: [
                { role: 'user', content: prompt },
            ],
        });

        // Check if the content block is of type 'text'
        const textBlock = response.content.find(block => block.type === 'text');

        if (textBlock && 'text' in textBlock) {
            return textBlock.text;
        } else {
            return "No text response received";
        }
    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw error;
    }
}