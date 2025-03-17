import Anthropic from '@anthropic-ai/sdk';
import { Message } from 'discord.js';
import { sanitizeResponse } from '../utils';
import { executeTool } from './tools';

// Gather the about me and discord guidelines context for the AI assistant
import { seroAgentDescription, discordContext, toolsContext } from '../context/context';

const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';
const SYSTEM_PROMPT = `${seroAgentDescription} \n ${discordContext} \n ${toolsContext}`;
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
                    name: "moderateUser",
                    description: "Find and moderate a Discord user with various actions",
                    input_schema: {
                        type: "object",
                        properties: {
                            user: {
                                type: "string",
                                description: "The username or user ID to find"
                            },
                            actions: {
                                type: "array",
                                items: {
                                    type: "string",
                                    enum: ["timeout", "disconnect", "kick", "ban"]
                                },
                                description: "Array of moderation actions to perform"
                            },
                            duration: {
                                type: "number",
                                description: "Duration in minutes for timeout (ignored for other actions)"
                            },
                            reason: {
                                type: "string",
                                description: "Reason for the moderation actions"
                            }
                        },
                        required: ["user"]
                    }
                },
                {
                    name: "miscUtilities",
                    description: "Additional utility actions for Discord, e.g. slowmode, move, sendChannelMessage",
                    input_schema: {
                        type: "object",
                        properties: {
                            user: {
                                type: "string",
                                description: "The username or user ID to find"
                            },
                            actions: {
                                type: "array",
                                items: {
                                    type: "string",
                                    enum: ["slowmode", "move", "sendChannelMessage"]
                                },
                                description: "Array of utilities actions to perform"
                            },
                            channels: {
                                type: "array",
                                items: {
                                    type: "string",
                                    description: "The channel ID or name to find"
                                },
                                description: "Channel(s) to perform actions in. For move action, please provide two channels",
                            },
                            message: {
                                type: "string",
                                description: "Message for sendChannelMessage (ignored for other actions)"
                            },
                            ratelimit: {
                                type: "number",
                                description: "Ratelimit in seconds for slowmode (ignored for other actions)"
                            }
                        },
                        required: ["user", "channels"]
                    }
                },
                {
                    name: "userInformation",
                    description: "Get detailed information about a Discord user, optionally including messageCount, auditLogs, seroLogs, seroActivity",
                    input_schema: {
                        type: "object",
                        properties: {
                            user: {
                                type: "string",
                                description: "The username or user ID to find"
                            },
                            channels: {
                                type: "array",
                                items: {
                                    type: "string",
                                    description: "The channel ID or name to find"
                                },
                                description: "The channel(s) to find information in (optional)",
                            },
                            actions: {
                                type: "array",
                                items: {
                                    type: "string",
                                    enum: ["messageCount", "auditLogs", "seroLogs", "seroActivity"]
                                },
                                description: "Array of actions to perform. If empty, only user information is returned"
                            },
                            limit: {
                                type: "number",
                                description: "Limit for the number of logs to return for each action, max 10"
                            }
                        },
                        required: ["user"]
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