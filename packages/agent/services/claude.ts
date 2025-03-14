import Anthropic from '@anthropic-ai/sdk';
import { Message } from 'discord.js';
import { sanitizeResponse } from '../utils';
import { getAllTools, executeTool } from './tools';

// Gather the about me and discord guidelines context for the AI assistant
import { seroAgentDescription, discordGuideline } from '../context/context';

const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';
const SYSTEM_PROMPT = `${seroAgentDescription} \n ${discordGuideline}`;
const MAX_TOKENS = 500;
const MAX_CONTEXT_MESSAGES = 10;

// Initialize the client with your API key
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Message history storage: Map<channelId_userId, messages[]>
const messageHistory = new Map<string, any[]>();

export async function askClaude(
    prompt: string,
    message: Message,
    previousMessages: any[] = []
): Promise<string | undefined> {
    try {
        const guild = message.guild;
        const channel = message.channel;
        const user = message.author;

        // Create a unique conversation key based on channel and user
        const conversationKey = `${channel.id}_${user.id}`;

        // Get existing message history or initialize if none exists
        let conversationHistory = messageHistory.get(conversationKey) || [];

        // If previousMessages is provided (from a tool call), use that instead
        if (previousMessages.length > 0) {
            conversationHistory = previousMessages;
        } else if (prompt) {
            // Add the new user message to history
            conversationHistory.push({ role: 'user', content: prompt });
        }

        // Ensure we only keep the most recent MAX_CONTEXT_MESSAGES
        if (conversationHistory.length > MAX_CONTEXT_MESSAGES * 2) { // *2 because each exchange has both user and assistant messages
            conversationHistory = conversationHistory.slice(-MAX_CONTEXT_MESSAGES * 2);
        }

        const systemPrompt = SYSTEM_PROMPT
            .replace('{{date}}', new Date().toLocaleDateString())
            .replace('{{guildId}}', guild?.id ?? 'private')
            .replace('{{guildName}}', guild?.name ?? 'private')
            .replace('{{channelId}}', channel.id)
            .replace('{{channelName}}', 'name' in channel && channel.name ? channel.name : 'Direct Message')
            .replace('{{userId}}', user.id)
            .replace('{{username}}', user.username);

        const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: MAX_TOKENS,
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
                {
                    name: "disconnectUser",
                    description: "Disconnect a user from the voice channel",
                    input_schema: {
                        type: "object",
                        properties: {
                            userId: {
                                type: "string",
                                description: "The user's Id, e.g. '1234567890'",
                            }
                        },
                        required: ["userId"]
                    }
                },
                {
                    name: "getAllChannels",
                    description: "Get all channels in the server",
                    input_schema: {
                        type: "object",
                        properties: {},
                    }
                },
                {
                    name: "findChannel",
                    description: "Find a guild channel based on a channelId or channel-name",
                    input_schema: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "The channel name or Id, e.g. '1234567890' or 'name'",
                            }
                        },
                        required: ["query"]
                    }
                },
                {
                    name: "sendChannelMessage",
                    description: "Send a message to a channel (preferred method)",
                    input_schema: {
                        type: "object",
                        properties: {
                            channelId: {
                                type: "string",
                                description: "The channel's Id, e.g. '1234567890'",
                            },
                            content: {
                                type: "string",
                                description: "The message content to send",
                            }
                        },
                        required: ["channelId", "content"]
                    }
                },
                {
                    name: "sendDMMessage",
                    description: "Send a direct message to a user (only use when explicitly requested)",
                    input_schema: {
                        type: "object",
                        properties: {
                            userId: {
                                type: "string",
                                description: "The user's Id, e.g. '1234567890'",
                            },
                            content: {
                                type: "string",
                                description: "The message content to send",
                            }
                        },
                        required: ["userId", "content"]
                    }
                },
                {
                    name: "getAuditLogs",
                    description: "Get activity logs for a user in the server",
                    input_schema: {
                        type: "object",
                        properties: {
                            userId: {
                                type: "string",
                                description: "The user's Id, e.g. '1234567890'",
                            },
                            limit: {
                                type: "number",
                                description: "The number of audit logs to retrieve",
                            }
                        },
                        required: ["userId"]
                    }
                },
                {
                    name: "getSeroLogs",
                    description: "Get moderation logs of a user in the server",
                    input_schema: {
                        type: "object",
                        properties: {
                            userId: {
                                type: "string",
                                description: "The user's Id, e.g. '1234567890'",
                            },
                            limit: {
                                type: "number",
                                description: "The number of (audit) logs to retrieve",
                            }
                        },
                        required: ["userId"]
                    }
                },
                {
                    name: "getChannelMessages",
                    description: "Fetch recent messages from a channel",
                    input_schema: {
                        type: "object",
                        properties: {
                            channelId: {
                                type: "string",
                                description: "The channel's Id, e.g. '1234567890'",
                            },
                            limit: {
                                type: "number",
                                description: "The number of messages to fetch",
                            }
                        },
                        required: ["userId"]
                    }
                },
                {
                    name: "getUserMessages",
                    description: "Fetch recent messages from a user",
                    input_schema: {
                        type: "object",
                        properties: {
                            userId: {
                                type: "string",
                                description: "The user's Id, e.g. '1234567890'",
                            },
                            limit: {
                                type: "number",
                                description: "The number of messages to fetch",
                            }
                        },
                        required: ["userId"]
                    }
                }
            ],
            // tool_choice: { type: "any" },
            messages: conversationHistory,
        });

        if (response.stop_reason === "tool_use") {
            const textContent = response.content.find((c) => c.type === "text")?.text ?? "";
            const toolRequest = response.content.find((c) => c.type === "tool_use");

            if (!toolRequest) return "No valid tool request found";

            // Reply with temporary response if Claude provided text
            if (textContent) {
                await message.reply(sanitizeResponse(textContent));
            }

            // Extract tool details
            const { id, name, input } = toolRequest;

            // Add assistant's response to conversation history
            conversationHistory.push({
                role: 'assistant',
                content: [
                    ...(textContent ? [{ type: "text", text: textContent }] : []),
                    { type: "tool_use", id, name, input }
                ]
            });

            // Execute the tool and get the result
            const toolResult = await executeTool(name, message, input);

            // Add tool result to conversation history
            conversationHistory.push({
                role: 'user',
                content: [
                    { type: "tool_result", tool_use_id: id, content: toolResult }
                ]
            });

            // Update the stored history
            messageHistory.set(conversationKey, conversationHistory);

            // Recursive call with tool result and updated message history
            return await askClaude("", message, conversationHistory);
        } else {
            // Get final response if no tool use
            const finalResponse = response.content.find(c => c.type === "text")?.text ?? "";

            if (finalResponse) {
                // Add assistant's response to conversation history
                conversationHistory.push({
                    role: 'assistant',
                    content: finalResponse
                });

                // Update the stored history
                messageHistory.set(conversationKey, conversationHistory);

                await message.reply(sanitizeResponse(finalResponse));
            }

            return finalResponse;
        }
    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw error;
    }
}