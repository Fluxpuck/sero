import { Message } from 'discord.js';
import { Tool } from '../types/tool.types';
import { UserToolDetails, findUser } from '../tools/userTool';

// Interface for tool execution functions
interface ToolFunction {
    (message: Message, ...args: any[]): Promise<string> | string;
}

// Map to store all tool functions
const toolFunctions = new Map<string, ToolFunction>();

// Initialize tools
export function initializeTools() {
    // Register user tools
    toolFunctions.set('findUser', findUser);

    // Register other tools here as they are added
    // toolFunctions.set('otherTool', otherToolFunction);
}

// Get all tool definitions
export function getAllTools() {
    return [
        ...UserToolDetails,
        // Add other tool details arrays here as they are added
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