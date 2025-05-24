import { Message, Client } from 'discord.js';
import { ClaudeToolType } from '../types/tool.types';

import { DiscordGuildInfoTool } from '../tools/discord_guild_info.tool';
import { DiscordFetchMessagesTool } from '../tools/discord_fetch_messages.tool';
import { DiscordModerationTool } from '../tools/discord_moderation_actions.tool';
import { DiscordSendMessageTool } from '../tools/discord_send_message.tool';

// Map to store tool instances
const toolInstances = new Map<string, ClaudeToolType>();

/**
 * Initialize tools with message and client context
 */
export function initializeTools(message: Message, client: Client) {
    toolInstances.set('discord_guild_info', new DiscordGuildInfoTool(client, message));
    toolInstances.set('discord_fetch_messages', new DiscordFetchMessagesTool(client, message));
    toolInstances.set('discord_moderation_actions', new DiscordModerationTool(client, message));
    toolInstances.set('discord_send_message', new DiscordSendMessageTool(client, message));
}

/**
 * Execute a tool by name with input
 */
export async function executeTool(
    toolName: string,
    input: any
): Promise<string> {
    const tool = toolInstances.get(toolName);

    if (!tool) {
        throw new Error(`Tool "${toolName}" not found`);
    }

    try {
        return await tool.execute(input);
    } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        throw new Error(
            `Error executing tool "${toolName}": ${error instanceof Error ? error.message : String(error)}`
        );
    }
}