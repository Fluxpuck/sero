import Anthropic from '@anthropic-ai/sdk';
import { Message } from 'discord.js';

import { sanitizeResponse } from '../utils';

// Gather the about me and discord guidelines context for the AI assistant
import { seroAgentDescription, discordGuideline } from '../context/context';

const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';
const SYSTEM_PROMPT = `${seroAgentDescription} \n ${discordGuideline}`

// Initialize the client with your API key
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function askClaude(prompt: string, message: Message): Promise<string> {
    try {
        const guild = message.guild;
        const channel = message.channel;
        const user = message.author;

        const systemPrompt = SYSTEM_PROMPT
            .replace('{{guildId}}', guild?.id ?? 'private')
            .replace('{{guildName}}', guild?.name ?? 'private')
            .replace('{{channelId}}', channel.id)
            .replace('{{channelName}}', 'name' in channel && channel.name ? channel.name : 'Direct Message')
            .replace('{{userId}}', user.id)
            .replace('{{username}}', user.username);

        // Call the Claude API
        const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 1_024,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
        }); 

        // Process the response and handle tool calls
        const textBlock = response.content.find(block => block.type === 'text');
        if (!textBlock || !('text' in textBlock)) {
            return "No text response received";
        }

        const sanitizedResponse = sanitizeResponse(textBlock.text);
        return sanitizedResponse;

    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw error;
    }
}
