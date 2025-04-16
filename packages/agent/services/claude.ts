import Anthropic from '@anthropic-ai/sdk';
import { Message } from 'discord.js';
import { sanitizeResponse } from '../utils';
import { executeTool, initializeTools } from '../services/tools';
import { retryApiCall } from './api';

// Gather the about me and discord guidelines context for the AI assistant
import {
    seroAgentDescription, discordContext, toolsContext, disclosedContext,
    SSundeeRules, SSundeeInformation, SSundeeFAQ
} from '../context/context';

// Gather the Tool Contexts
import { DiscordSendMessageToolContext } from '../tools/discord_send_message.tool';
import { DiscordGuildInfoToolContext } from '../tools/discord_guild_info.tool';
import { DiscordFetchMessagesToolContext } from '../tools/discord_fetch_messages.tool';
import { DiscordModerationToolContext } from '../tools/discord_moderation_actions.tool';
import { DiscordUserLogsToolContext } from '../tools/discord_user_logs.tool';
import { SeroUtilityToolContext } from '../tools/sero_utility_actions.tool';
import { TaskSchedulerToolContext } from '../tools/task_scheduler.tool';

// Gather the conversation history
import {
    createConversationKey,
    getConversationHistory,
    updateConversationHistory,
    deleteConverstationHistory
} from '../services/history';

export class ClaudeService {
    private anthropic: Anthropic;
    private readonly CLAUDE_REASONING_MODEL = 'claude-3-5-haiku-20241022';
    private readonly CLAUDE_EXECUTION_MODEL = 'claude-3-5-haiku-20241022';
    private readonly MAX_TOKENS_REASONING = 1024;
    private readonly MAX_TOKENS_EXECUTION = 2048;

    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    /**
     * Prepare system prompt with context variables replaced
     */
    private prepareSystemPrompt(message: Message): string {
        const SYSTEM_PROMPT = `
        ${seroAgentDescription} \n 
        ${discordContext} \n 
        ${toolsContext} \n 
        ${disclosedContext} \n 
        ${SSundeeRules} \n 
        ${SSundeeInformation} \n 
        ${SSundeeFAQ}`;

        return SYSTEM_PROMPT
            .replace('{{date}}', new Date().toLocaleDateString())
            .replace('{{time}}', new Date().toLocaleTimeString())
            .replace('{{guildName}}', message.guild?.name ?? 'private')
            .replace('{{guildId}}', message.guild?.id ?? 'private')
            .replace(`{{username}}`, message.author.username)
            .replace(`{{userId}}`, message.author.id)
            .replace('{{channelName}}', 'name' in message.channel && message.channel.name ? message.channel.name : 'Direct Message')
            .replace('{{channelId}}', message.channel.id);
    }

    /**
     * Get the available tools context for API calls
     */
    private getTools() {
        return [
            ...DiscordSendMessageToolContext,
            ...DiscordGuildInfoToolContext,
            ...DiscordFetchMessagesToolContext,
            ...DiscordModerationToolContext,
            ...DiscordUserLogsToolContext,
            ...SeroUtilityToolContext,
            ...TaskSchedulerToolContext,
        ];
    }

    /**
     * Reasoning function - Allows Claude to use tools and engage in multi-turn reasoning
     */
    public async reasoning(
        prompt: string,
        message: Message,
        previousMessages: any[] = [],
    ): Promise<string | undefined> {
        // Create a unique key for the conversation based on channel and user ID
        const conversationKey = createConversationKey(message.channel.id, message.author.id);

        try {
            // Initialize tools with message context
            initializeTools(message, message.client);
            const systemPrompt = this.prepareSystemPrompt(message);

            // Get the conversation history
            let conversationHistory = getConversationHistory(conversationKey) || [];

            if (previousMessages.length > 0) {
                conversationHistory = previousMessages;
            } else if (prompt) {
                conversationHistory.push({ role: 'user', content: prompt });
            }

            // Call the Claude API with retry logic
            const response = await retryApiCall(() =>
                this.anthropic.messages.create({
                    model: this.CLAUDE_REASONING_MODEL,
                    max_tokens: this.MAX_TOKENS_REASONING,
                    system: systemPrompt,
                    tools: this.getTools(),
                    messages: conversationHistory,
                })
            );

            if (response.stop_reason === "tool_use") {
                const textContent = response.content.find((c) => c.type === "text")?.text ?? "";
                const toolRequest = response.content.find((c) => c.type === "tool_use");

                if (!toolRequest) return "No valid tool request found";

                // Reply with temporary response if Claude provided text
                if (textContent) {
                    await message.reply(sanitizeResponse(textContent)).catch((err) => {
                        console.error('Error sending reply:', err);
                    });
                }

                try {
                    // Extract tool details
                    const { id, name, input } = toolRequest;

                    // Execute the tool and get the result first
                    const toolResult = await executeTool(name, input);

                    // Only update history if tool execution was successful
                    const updatedHistory = [
                        ...conversationHistory,
                        {
                            role: 'assistant',
                            content: [
                                ...(textContent ? [{ type: "text", text: textContent }] : []),
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

                    // Update the stored history only after successful execution
                    updateConversationHistory(conversationKey, updatedHistory);

                    // Recursive call with tool result and updated message history
                    return await this.reasoning("", message, updatedHistory);

                } catch (error) {
                    // Delete conversation history on error
                    deleteConverstationHistory(conversationKey);

                    console.error('Error executing tool:', error);
                    throw error;
                }
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
                    updateConversationHistory(conversationKey, conversationHistory);

                    await message.reply(sanitizeResponse(finalResponse)).catch((err) => {
                        console.error('Error sending reply:', err);
                    });
                }
                return finalResponse;
            }
        } catch (error) {
            // Delete conversation history on error
            deleteConverstationHistory(conversationKey);

            console.error('Error calling Claude API:', error);
            throw error;
        }
    }

    /**
     * Execute function - Gets Claude to execute a prompt directly without multi-turn reasoning
     * Useful for straightforward tasks that don't require complex reasoning chains
     */
    public async execute(
        prompt: string,
        message: Message,
    ): Promise<string | undefined> {
        try {
            // Initialize tools with message context
            initializeTools(message, message.client);
            const systemPrompt = this.prepareSystemPrompt(message);

            // Simplified prompt without conversation history
            const messageContent = [{ role: 'user' as const, content: prompt }];

            // Call the Claude API with retry logic
            const response = await retryApiCall(() =>
                this.anthropic.messages.create({
                    model: this.CLAUDE_EXECUTION_MODEL,
                    max_tokens: this.MAX_TOKENS_EXECUTION,
                    system: systemPrompt,
                    tools: this.getTools(), // Add tools so Claude can use them if needed
                    messages: messageContent,
                })
            );

            // Handle tool use case (single tool execution without conversation)
            if (response.stop_reason === "tool_use") {
                const textContent = response.content.find((c) => c.type === "text")?.text ?? "";
                const toolRequest = response.content.find((c) => c.type === "tool_use");

                if (!toolRequest) return "No valid tool request found";

                // Send any explanatory text before tool execution
                if (textContent) {
                    await message.reply(sanitizeResponse(textContent)).catch((err) => {
                        console.error('Error sending reply:', err);
                    });
                }

                // Extract tool details and execute
                const { name, input } = toolRequest;
                const toolResult = await executeTool(name, input);

                // Get final answer using tool result, without starting a conversation
                const finalResponse = await this.getFinalAnswer(toolResult, systemPrompt);

                if (finalResponse) {
                    await message.reply(sanitizeResponse(finalResponse)).catch((err) => {
                        console.error('Error sending reply:', err);
                    });
                }

                return finalResponse;
            } else {
                // Get response if no tool use
                const finalResponse = response.content.find(c => c.type === "text")?.text ?? "";

                if (finalResponse) {
                    await message.reply(sanitizeResponse(finalResponse)).catch((err) => {
                        console.error('Error sending reply:', err);
                    });
                }

                return finalResponse;
            }
        } catch (error) {
            console.error('Error calling Claude API for execution:', error);
        }
    }

    /**
     * Helper method to get a final answer after tool execution
     * Doesn't create conversation history or reasoning chains
     */
    private async getFinalAnswer(
        toolResult: string,
        systemPrompt: string
    ): Promise<string | undefined> {
        try {
            // Create a prompt instructing Claude to provide a final answer based on tool results
            const finalPrompt = `Here is the result of executing a tool. Please provide a final answer based on this information only. Do not engage in further reasoning or suggest additional actions:\n\n${toolResult}`;

            // Call Claude to interpret the tool result
            const response = await retryApiCall(() =>
                this.anthropic.messages.create({
                    model: this.CLAUDE_EXECUTION_MODEL,
                    max_tokens: this.MAX_TOKENS_EXECUTION,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: finalPrompt }],
                })
            );

            return response.content.find(c => c.type === "text")?.text ?? "";
        } catch (error) {
            console.error('Error getting final answer:', error);
            return `Error processing result: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
}
