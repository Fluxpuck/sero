import { Message } from 'discord.js';
import { UserToolDetails, findUser, timeoutUser, disconnectUser } from '../tools/userTool';
import { ChannelToolDetails, getAllChannels, findChannel, sendChannelMessage, sendDMMessage } from '../tools/channelTool';
import { AuditToolDetails, getAuditLogs, getSeroLogs } from '../tools/auditTool';

// Interface for tool execution functions
interface ToolFunction {
    (message: Message, ...args: any[]): Promise<string> | string;
}

// Map to store all tool functions
const toolFunctions = new Map<string, ToolFunction>();

// Initialize tools
export function initializeTools() {
    toolFunctions.set('findUser', findUser);
    toolFunctions.set('timeoutUser', timeoutUser);
    toolFunctions.set('disconnectUser', disconnectUser);

    toolFunctions.set('getAllChannels', getAllChannels);
    toolFunctions.set('findChannel', findChannel);
    toolFunctions.set('sendChannelMessage', sendChannelMessage);
    toolFunctions.set('sendDMMessage', sendDMMessage);

    toolFunctions.set('getAuditLogs', getAuditLogs);
    toolFunctions.set('getSeroLogs', getSeroLogs);
}

// Get all tool definitions
export function getAllTools() {
    return [
        ...UserToolDetails,
        ...ChannelToolDetails,
        ...AuditToolDetails,
    ];
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