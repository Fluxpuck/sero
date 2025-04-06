import Anthropic from '@anthropic-ai/sdk';
import { Message, ChatInputCommandInteraction } from 'discord.js';
import { sanitizeResponse } from '../utils';
import { executeTool, initializeTools } from '../services/tools';

// Gather the about me and discord guidelines context for the AI assistant
import {
    seroAgentDescription, discordContext, toolsContext,
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

// Initialize the client with your API key
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function askClaude(
    prompt: string,
    message: Message,
    previousMessages: any[] = [],
): Promise<string | undefined> {

    const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';
    const SYSTEM_PROMPT = `${seroAgentDescription} \n ${discordContext} \n ${toolsContext}`;
    const MAX_TOKENS = 1024;

    // Create a unique key for the conversation based on channel and user ID
    const conversationKey = createConversationKey(message.channel.id, message.author.id);

    try {
        // Initialize tools with message context
        initializeTools(message, message.client);

        const systemPrompt = SYSTEM_PROMPT
            .replace('{{date}}', new Date().toLocaleDateString())
            .replace('{{time}}', new Date().toLocaleTimeString())
            .replace('{{guildName}}', message.guild?.name ?? 'private')
            .replace('{{guildId}}', message.guild?.id ?? 'private')
            .replace(`{{username}}`, message.author.username)
            .replace(`{{userId}}`, message.author.id)
            .replace('{{channelName}}', 'name' in message.channel && message.channel.name ? message.channel.name : 'Direct Message')
            .replace('{{channelId}}', message.channel.id)

        // Get the conversation history
        let conversationHistory = getConversationHistory(conversationKey) || [];

        if (previousMessages.length > 0) {
            conversationHistory = previousMessages;
        } else if (prompt) {
            conversationHistory.push({ role: 'user', content: prompt });
        }

        // Call the Claude API
        const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: MAX_TOKENS,
            system: systemPrompt,
            tools: [
                ...DiscordSendMessageToolContext,
                ...DiscordGuildInfoToolContext,
                ...DiscordFetchMessagesToolContext,
                ...DiscordModerationToolContext,
                ...DiscordUserLogsToolContext,
                ...SeroUtilityToolContext,
                ...TaskSchedulerToolContext,
            ],
            messages: conversationHistory,
        });

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
                return await askClaude("", message, updatedHistory);

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

export async function askClaudeCommand(
    prompt: string,
    interaction: ChatInputCommandInteraction,
    previousMessages: any[] = [],
): Promise<string | undefined> {

    const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';
    const SYSTEM_PROMPT = `${seroAgentDescription} \n ${discordContext} \n ${SSundeeRules} \n ${SSundeeInformation} \n ${SSundeeFAQ}`;
    const MAX_TOKENS = 256;

    // Create a unique key for the conversation based on channel and user ID
    const conversationKey = createConversationKey(interaction.channelId, interaction.user.id);

    try {
        const systemPrompt = SYSTEM_PROMPT
            .replace('{{date}}', new Date().toLocaleDateString())
            .replace('{{time}}', new Date().toLocaleTimeString())
            .replace('{{guildName}}', interaction.guild?.name ?? 'private')
            .replace('{{guildId}}', interaction.guild?.id ?? 'private')
            .replace(`{{username}}`, interaction.user.username)
            .replace(`{{userId}}`, interaction.user.id)
            .replace('{{channelName}}', interaction.channel && 'name' in interaction.channel && interaction.channel.name ? interaction.channel.name : 'Direct Message')
            .replace('{{channelId}}', interaction.channelId)

        // Get the conversation history
        let conversationHistory = getConversationHistory(conversationKey) || [];

        if (previousMessages.length > 0) {
            conversationHistory = previousMessages;
        } else if (prompt) {
            conversationHistory.push({ role: 'user', content: prompt });
        }

        // Call the Claude API
        const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: MAX_TOKENS,
            system: systemPrompt,
            messages: conversationHistory,
        });

        // Get final response
        const finalResponse = response.content.find(c => c.type === "text")?.text ?? "";

        if (finalResponse) {
            // Add assistant's response to conversation history
            conversationHistory.push({
                role: 'assistant',
                content: finalResponse
            });

            // Update the stored history
            updateConversationHistory(conversationKey, conversationHistory);

            // Check if the interaction is deferred and use the appropriate method
            if (interaction.deferred) {
                await interaction.editReply({ content: sanitizeResponse(finalResponse) }).catch((err) => {
                    console.error('Error editing reply:', err);
                });
            } else {
                await interaction.reply({ content: sanitizeResponse(finalResponse), ephemeral: true }).catch((err) => {
                    console.error('Error sending reply:', err);
                });
            }

        }
        return finalResponse;

    } catch (error) {
        // Delete conversation history on error
        deleteConverstationHistory(conversationKey);

        console.error('Error calling Claude API:', error);

        // Try to send error message if the interaction hasn't timed out
        try {
            if (interaction.deferred) {
                await interaction.editReply({ content: "Sorry, I encountered an error while processing your request." });
            } else {
                await interaction.reply({ content: "Sorry, I encountered an error while processing your request.", ephemeral: true });
            }
        } catch (replyError) {
            console.error('Error sending error response:', replyError);
        }

        throw error;
    }

}