import Anthropic from '@anthropic-ai/sdk';
import { Message } from 'discord.js';
import { sanitizeResponse } from '../utils';
import { executeTool, initializeTools } from '../services/tools';
import { retryApiCall } from './api';
import { MessageViolationCheckInput } from '../types/message.types';
import { replyOrSend } from '../utils/replyOrSend';

type ClaudeOptions = {
    previousMessages?: any[];
    reasoning?: boolean;
    excludeTools?: boolean;
    finalResponse?: boolean;
}

type ClaudeContextOptions = {
    seroAgent: boolean;
    moderationContext: boolean;
    discordContext: boolean;
    toolsContext: boolean;
    SSundeeContext: boolean;
}

// Gather the about me and discord guidelines context for the AI assistant
import {
    seroAgentDescription, moderationContext, discordContext, toolsContext, disclosedContext,
    SSundeeRules, SSundeeInformation, SSundeeFAQ
} from '../context/context';

// Gather the Tool Contexts
import { DiscordSendMessageToolContext } from '../tools/discord_send_message.tool';
import { DiscordGuildInfoToolContext } from '../tools/discord_guild_info.tool';
import { DiscordFetchMessagesToolContext } from '../tools/discord_fetch_messages.tool';
import { DiscordModerationToolContext } from '../tools/discord_moderation_actions.tool';
import { DiscordUserLogsToolContext } from '../tools/discord_user_logs.tool';
import { DiscordUserActionsToolContext } from '../tools/discord_user_actions.tool';
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
    private readonly CLAUDE_MODEL = 'claude-3-5-haiku-20241022';
    private readonly MAX_TOKENS = 1024;

    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    /**
     * Prepare system prompt with context variables replaced
     */
    private prepareSystemPrompt(
        message: Message,
        context_options: ClaudeContextOptions = {
            seroAgent: true,
            moderationContext: false,
            discordContext: true,
            toolsContext: true,
            SSundeeContext: true
        },
        additional_context: string = ''
    ): string {
        // Build context based on options
        const contextParts = [];

        if (context_options.seroAgent) {
            contextParts.push(seroAgentDescription);
        }

        if (context_options.moderationContext) {
            contextParts.push(moderationContext);
        }

        if (context_options.discordContext) {
            contextParts.push(discordContext);
        }

        if (context_options.toolsContext) {
            contextParts.push(toolsContext);
            contextParts.push(disclosedContext);
        }

        if (context_options.SSundeeContext) {
            contextParts.push(SSundeeRules);
            contextParts.push(SSundeeInformation);
            contextParts.push(SSundeeFAQ);
        }

        // Add additional context if provided
        if (additional_context) {
            contextParts.push(additional_context);
        }

        const SYSTEM_PROMPT = contextParts.join('\n');

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
            ...DiscordUserActionsToolContext,
            ...SeroUtilityToolContext,
            ...TaskSchedulerToolContext,
        ];
    }

    public async askClaude(
        prompt: string,
        message: Message,
        options?: ClaudeOptions
    ): Promise<string | undefined> {

        // Set default values for ClaudeOptions
        const previousMessages = (options?.previousMessages ?? []);
        const reasoning = (options?.reasoning ?? true);
        const excludeTools = (options?.excludeTools ?? false);
        const finalResponse = (options?.finalResponse ?? true);

        // Create a unique key for the conversation based on channel and user ID
        const conversationKey = createConversationKey(message.channel.id, message.author.id);

        try {

            if ('sendTyping' in message.channel) {
                await message.channel.sendTyping();
            }

            // Initialize tools and system prompt
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
                    model: this.CLAUDE_MODEL,
                    max_tokens: this.MAX_TOKENS,
                    system: systemPrompt,
                    ...(excludeTools ? {} : { tools: this.getTools() }), // Exclude tools if specified
                    messages: conversationHistory,
                })
            );

            if (response.stop_reason === "tool_use") {
                const textResponse = response.content.find((c) => c.type === "text")?.text ?? "";
                const toolRequest = response.content.find((c) => c.type === "tool_use");
                if (!toolRequest) return;

                // Reply with temporary response if Claude provided text
                if (textResponse && reasoning) {
                    await replyOrSend(message, sanitizeResponse(textResponse)).catch((err) => {
                        console.error('Error sending temporary response:', err);
                    });
                }

                try {
                    // Execute the tool and get the result
                    const { id, name, input } = toolRequest;
                    const toolResult = await executeTool(name, input);

                    // Only update history if tool execution was successful
                    const updatedHistory = [
                        ...conversationHistory,
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

                    // Update the stored history only after successful execution
                    updateConversationHistory(conversationKey, updatedHistory);

                    // Recursive call with tool result and updated message history
                    return await this.askClaude("", message, {
                        previousMessages: updatedHistory
                    });

                } catch (error) {
                    console.error('Error executing tool:', error);

                    // Delete conversation history on error
                    deleteConverstationHistory(conversationKey);
                }
            }

            if (response.stop_reason === "end_turn") {
                const textResponse = response.content.find((c) => c.type === "text")?.text ?? "";

                // Only update history if tool execution was successful
                const updatedHistory = [
                    ...conversationHistory,
                    {
                        role: 'assistant',
                        content: textResponse
                    }
                ];

                // Update the stored history only after successful execution
                updateConversationHistory(conversationKey, updatedHistory);

                // Reply with the final response
                if (finalResponse) {
                    await replyOrSend(message, sanitizeResponse(textResponse)).catch((err) => {
                        console.error('Error sending final response:', err);
                    });
                }
            }

        } catch (error) {
            console.error('Error on askClaude:', error);

            // Delete conversation history on error
            deleteConverstationHistory(conversationKey);
        }
    }


    public async checkViolation(
        message: Message,
        messageCollection?: MessageViolationCheckInput
    ): Promise<string | undefined> {
        try {
            // Initialize tools for direct access in this function
            initializeTools(message, message.client);

            // Initialize system prompt with more lenient guidance but include tools context
            const checkViolationContext = `
            You are a Discord server moderator responsible for identifying and acting on rule violations.
            
            Analyze the messages in the conversation for patterns of behavior that violate server rules.
            Your goal is to identify clear and significant rule violations that would be widely considered inappropriate by most moderators.

            Please consider giving a warning for minor violations. Only issue a timeout for serious violations.
            You are not allowed to issue bans or kicks.
            
            If you detected a serious violation please choose to only reply with a warning or utilize the moderation tools and take appropriate action.
            If no violation is detected, simply return: "NO_VIOLATION_DETECTED"
            
            `;

            const systemPrompt = this.prepareSystemPrompt(message, {
                seroAgent: true,
                moderationContext: true,
                discordContext: true,
                toolsContext: true,
                SSundeeContext: true
            }, checkViolationContext);

            // Get message content and ensure it's not empty
            const messageContent = messageCollection?.messages ?? message.content;

            // Check if content is empty or undefined
            if (!messageContent || messageContent.trim() === '') {
                console.log('Warning: Empty message content in checkViolation, skipping API call');
                return;
            }

            // Call the Claude API with retry logic
            const response = await retryApiCall(() =>
                this.anthropic.messages.create({
                    model: this.CLAUDE_MODEL,
                    max_tokens: this.MAX_TOKENS,
                    system: systemPrompt,
                    tools: [
                        ...DiscordModerationToolContext  // Only include moderation tools
                    ],
                    messages: [{
                        role: 'user',
                        content: messageContent
                    }],
                })
            );

            console.log("Checking for violations...", response);

            if (response.stop_reason === "tool_use") {
                const toolRequest = response.content.find((c) => c.type === "tool_use");
                if (!toolRequest) return;

                try {
                    // Execute the tool and get the result
                    const { name, input } = toolRequest;
                    await executeTool(name, input);

                } catch (error) {
                    console.error('Error executing tool:', error);
                }
            }

        } catch (error) {
            console.error('Error on checkViolation:', error);
        }
    }
}