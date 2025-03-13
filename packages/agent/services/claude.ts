import Anthropic from '@anthropic-ai/sdk';
import { Message } from 'discord.js';
import { sanitizeResponse } from '../utils';
import { getAllTools, executeTool } from './tools';
import { contextManager } from '../context/contextManager';

// Gather the about me and discord guidelines context for the AI assistant
import { seroAgentDescription, discordGuideline } from '../context/context';

const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';
const SYSTEM_PROMPT = `${seroAgentDescription} \n ${discordGuideline}`

// Initialize the client with your API key
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function askClaude(
    prompt: string,
    message: Message,
    previousMessages: any[] = []
): Promise<string | undefined> {
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

        // Get stored context and combine with previous messages
        const storedContext = contextManager.getContext(message);
        const messages = [
            ...storedContext,
            ...previousMessages,
            { role: 'user', content: prompt }
        ];

        const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 1_024,
            system: systemPrompt,
            tools: [
                {
                    name: "findUser",
                    description: "Find a guild member based on a userId or username",
                    input_schema: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "The user's name or Id, e.g. '1234567890' or 'username'",
                            }
                        },
                        required: ["query"]
                    }
                },
                {
                    name: "timeoutUser",
                    description: "Timeout a user from sending messages for a specified duration",
                    input_schema: {
                        type: "object",
                        properties: {
                            userId: {
                                type: "string",
                                description: "The user's Id, e.g. '1234567890'",
                            },
                            duration: {
                                type: "string",
                                description: "The duration of the timeout in seconds, e.g. '60'. Preferably between 1 and 3600.",
                            },
                            reason: {
                                type: "string",
                                description: "The reason for the timeout, e.g 'Flooding the chat with messages' or 'Sending inappropriate content'",
                            }
                        },
                        required: ["userId", "duration", "reason"]
                    }
                },
            ],
            messages: messages,
        });

        if (response.stop_reason === "tool_use") {
            const textContent = response.content.find((c) => c.type === "text")?.text ?? "";
            const toolRequest = response.content.find((c) => c.type === "tool_use");

            if (!toolRequest) return "No valid tool request found";

            // Store Claude's response in context
            if (textContent) {
                contextManager.addMessage(message, [
                    { type: "text", text: textContent },
                    { type: "tool_use", id: toolRequest.id, name: toolRequest.name, input: toolRequest.input }
                ], 'assistant');
                await message.reply(sanitizeResponse(textContent));
            }

            // Extract tool details
            const { id, name, input } = toolRequest;

            // Execute the tool and get the result
            const toolResult = await executeTool(name, message, input);

            // Add assistant's response and tool result to conversation history
            const updatedMessages = [
                ...messages,
                {
                    role: 'assistant',
                    content: [
                        ...(textContent ? [{ type: "text", text: textContent }] : []),
                        { type: "tool_use", id, name, input }
                    ]
                },
                {
                    role: 'user',
                    content: [
                        { type: "tool_result", tool_use_id: id, content: toolResult }
                    ]
                }
            ];

            // Recursive call with tool result and updated message history
            return await askClaude("", message, updatedMessages);
        } else {
            // Store final response in context
            const finalResponse = response.content.find(c => c.type === "text")?.text ?? "";
            if (finalResponse) {
                contextManager.addMessage(message, [{ type: "text", text: finalResponse }], 'assistant');
                await message.reply(sanitizeResponse(finalResponse));
            }
            return finalResponse;
        }

    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw error;
    }
}
