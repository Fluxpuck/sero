import Anthropic from '@anthropic-ai/sdk';
import { Message } from 'discord.js';
import { sanitizeResponse } from '../utils';
import { executeTool, initializeTools } from '../services/tools';

// Gather the about me and discord guidelines context for the AI assistant
import { seroAgentDescription, discordContext, toolsContext } from '../context/context';

// Gather the Tool Contexts
import { DiscordSendMessageToolContext } from '../tools/discord_send_message.tool';
import { DiscordModerationToolContext } from '../tools/discord_moderation_actions.tool';
import { DiscordUserLogsToolContext } from '../tools/discord_user_logs.tool';
import { SeroUtilityToolContext } from '../tools/sero_utility_actions.tool';
import { TaskSchedulerToolContext } from '../tools/task_scheduler.tool';

// Gather the conversation history
import { createConversationKey, getConversationHistory, updateConversationHistory } from '../services/history';

const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';
const SYSTEM_PROMPT = `${seroAgentDescription} \n ${discordContext} \n ${toolsContext}`;
const MAX_TOKENS = 1024;

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
        // Initialize tools with message context
        initializeTools(message, message.client);

        const systemPrompt = SYSTEM_PROMPT
            .replace('{{date}}', new Date().toLocaleDateString())
            .replace('{{time}}', new Date().toLocaleTimeString())
            .replace('{{guildName}}', message.guild?.name ?? 'private')
            .replace('{{channelId}}', message.channel.id)
            .replace('{{channelName}}', 'name' in message.channel && message.channel.name ? message.channel.name : 'Direct Message')
            .replace('{{userId}}', message.author.id)
            .replace('{{username}}', message.author.username);

        // Get the conversation history
        const conversationKey = createConversationKey(message.channel.id, message.author.id);
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
                await message.reply(sanitizeResponse(textContent));
            }

            // Extract tool details
            const { id, name, input } = toolRequest;

            // Add assistant's response to conversation history
            conversationHistory.push({
                role: 'assistant',
                content: textContent || ""
            });

            // Add the tool request as a separate message
            conversationHistory.push({
                role: 'assistant',
                content: [{ type: "tool_use", id, name, input }]
            });

            // Execute the tool and get the result
            const toolResult = await executeTool(name, input);

            // Add tool result to conversation history
            conversationHistory.push({
                role: 'user',
                content: [{ type: "tool_result", tool_use_id: id, content: toolResult }]
            });

            // Update the stored history
            updateConversationHistory(conversationKey, conversationHistory);

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
                updateConversationHistory(conversationKey, conversationHistory);

                await message.reply(sanitizeResponse(finalResponse));
            }
            return finalResponse;
        }
    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw error;
    }
}