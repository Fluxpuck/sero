import { Message } from 'discord.js';

import { DiscordModerationTool } from '../tools/discord_moderation_actions.tool';
import { DiscordUserTool } from '../tools/discord_user_actions';

// Interface for tool execution functions
interface ToolFunction {
    (message: Message, ...args: any[]): Promise<string> | string;
}

// Map to store all tool functions
const toolFunctions = new Map<string, ToolFunction>();

// Initialize tools
export function initializeTools() {
    toolFunctions.set('discord_moderation_actions', DiscordModerationTool);
    toolFunctions.set('discord_user_actions', DiscordUserTool);
}

// Execute a tool by name
export async function executeTool(toolName: string, message: Message, ...args: any[]): Promise<string> {
    const tool = toolFunctions.get(toolName);

    if (!tool) {
        return `Tool "${toolName}" not found`;
    }

    try {
        return await tool(message, ...args);
    } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        return `Error executing tool "${toolName}": ${error instanceof Error ? error.message : String(error)}`;
    }
}