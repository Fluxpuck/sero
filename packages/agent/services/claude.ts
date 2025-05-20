import Anthropic from '@anthropic-ai/sdk';
import { Message } from 'discord.js';
import { first } from 'lodash';

// Import custom hooks
import useContext from '../hooks/useContext';
import useHistory from '../hooks/useHistory';

// Import Utility functions
import { sanitizeResponse } from '../utils';
import { replyOrSend } from '../utils/replyOrSend';

// Import tool classes for Claude context
import { executeTool, initializeTools } from './tools';
import { DiscordGuildInfoToolContext } from '../tools/discord_guild_info.tool';
import { DiscordFetchMessagesToolContext } from '../tools/discord_fetch_messages.tool';
import { DiscordModerationToolContext } from '../tools/discord_moderation_actions.tool';
import { DiscordSendMessageToolContext } from '../tools/discord_send_message.tool';

type ClaudeOptions = {
    previousMessages?: any[];
    reasoning?: boolean;
    excludeTools?: boolean;
    finalResponse?: boolean;
}

export class ClaudeService {
    private anthropic: Anthropic;
    private readonly CLAUDE_MODEL = 'claude-3-5-haiku-20241022';
    private readonly MAX_TOKENS = 1024;
    private historyManager: ReturnType<typeof useHistory>;

    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.historyManager = useHistory();
    }

    /**
     * Prepare system prompt for Claude using useContext hook
     * @param message - Discord message object
     * @returns Formatted system prompt
     */
    private prepareSystemPrompt(message: Message): string {
        const currentDate = new Date().toLocaleString();
        return useContext(
            currentDate,
            message.guild?.name || 'DM',
            (message.channel && 'name' in message.channel) ? (message.channel as any).name : 'DM'
        );
    }

    /**
     * Get available tools for Claude
     * @returns Array of tools for Claude API
     */
    private getTools() {
        return [
            ...DiscordGuildInfoToolContext,
            ...DiscordFetchMessagesToolContext,
            ...DiscordModerationToolContext,
            ...DiscordSendMessageToolContext,
        ];
    } public async askClaude(
        prompt: string,
        message: Message,
        options?: ClaudeOptions
    ): Promise<string | undefined> {
        // Generate a conversation key based on user ID and channel ID
        const conversationKey = `${message.author.id}-${message.channel.id}`;
        const { previousMessages = [], reasoning = true, excludeTools = false, finalResponse = true } = options || {};
        let textResponse = ""; // Define textResponse in the outer scope for returning later

        try {
            if ('sendTyping' in message.channel) {
                await message.channel.sendTyping();
            }

            // Initialize tools and system prompt
            initializeTools(message, message.client);
            const systemPrompt = this.prepareSystemPrompt(message);

            // Get the conversation history
            const historyObj = this.historyManager.getHistory(conversationKey);
            let messages = [];

            if (previousMessages.length > 0) {
                messages = previousMessages;
            } else if (prompt) {
                messages.push({ role: 'user', content: prompt });
            }

            // Call the Claude API with the SDK
            const response = await this.anthropic.messages.create({
                model: this.CLAUDE_MODEL,
                max_tokens: this.MAX_TOKENS,
                system: systemPrompt,
                tools: [
                    {
                        type: "web_search_20250305",
                        name: "web_search",
                        max_uses: 2,
                        allowed_domains: null,
                        blocked_domains: null,
                        user_location: {
                            type: "approximate",
                            city: "San Francisco",
                            region: "California",
                            country: "US",
                            timezone: "America/Los_Angeles"
                        }
                    },
                    ...(excludeTools ? [] : this.getTools())
                ],
                messages: messages,
            });

            console.log(`[Claude] Response:`, response);

            // Handle Tool use response
            if (response.stop_reason === "tool_use") {
                // Extract text and tool use information
                let textResponse = "";
                let toolUseBlock: any = null;

                for (const block of response.content) {
                    if (block.type === "text") {
                        textResponse = block.text;
                    } else if (block.type === "tool_use") {
                        toolUseBlock = block;
                    }
                }

                if (!toolUseBlock) return undefined;

                // Reply with temporary reasoning if Claude provided text
                if (textResponse && reasoning) {
                    await replyOrSend(message, sanitizeResponse(textResponse))
                        .catch(err => console.error('Error sending temp response:', err));
                }

                try {
                    // Execute the tool and get the result
                    const { id, name, input } = toolUseBlock;
                    const toolResult = await executeTool(name, input);

                    // Update history with new messages
                    const updatedMessages = [
                        ...messages,
                        {
                            role: 'assistant',
                            content: [
                                ...(textResponse ? [{ type: "text", text: textResponse }] : []),
                                { type: "tool_use", id, name, input }
                            ]
                        },
                        {
                            role: 'user',
                            content: [{
                                type: "tool_result",
                                tool_use_id: id,
                                content: toolResult
                            }]
                        }
                    ];

                    // Store user prompt and Claude's response in history
                    if (prompt && textResponse) {
                        this.historyManager.addToHistory(
                            historyObj,
                            prompt,
                            textResponse,
                            undefined
                        );
                    }

                    // Recursive call with tool result and updated history
                    return await this.askClaude("", message, {
                        previousMessages: updatedMessages,
                        reasoning,
                        excludeTools,
                        finalResponse
                    });

                } catch (error) {
                    console.error('Error executing tool:', error);
                    this.historyManager.deleteConversation(conversationKey);
                    return undefined;
                }
            }

            // Handle End response
            if (response.stop_reason === "end_turn") {
                // Get text from response
                let textResponse = "";
                let webSearchResults: any = null;

                for (const block of response.content) {
                    if (block.type === "web_search_tool_result") {
                        webSearchResults = block.content;
                    }

                    if (block.type === "text") {
                        textResponse += block.text;
                    }
                }

                // Store the conversation history with web search results if they exist
                if (prompt && textResponse) {
                    this.historyManager.addToHistory(
                        historyObj,
                        prompt,
                        textResponse,
                        webSearchResults
                    );
                }

                // Reply with the final response if requested
                if (finalResponse && textResponse) {
                    await replyOrSend(message, sanitizeResponse(textResponse))
                        .catch(err => console.error('Error sending response:', err));
                }

                return textResponse;
            }

            return undefined;

        } catch (error) {
            console.error('Error on askClaude:', error);
            this.historyManager.deleteConversation(conversationKey);
            return undefined;
        }
    }
}
