// src/tools/index.ts - Tools registry and executor
import { Message } from 'discord.js';
import { fetchUserMessages } from './user-messages';
import { searchChannelHistory } from './channel-search';
import { getUserInfo } from './user-info';
import { getChannelInfo } from './channel-info';
import { searchUser } from './search-user';

// Define tool schemas
export const toolsRegistry = [
    {
        name: 'fetchUserMessages',
        description: 'Fetch recent messages from a specific user in the current channel',
        parameters: {
            type: 'object',
            properties: {
                userId: {
                    type: 'string',
                    description: 'The Discord user ID to fetch messages from'
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of messages to fetch (default: 20)'
                }
            },
            required: ['userId']
        }
    },
    {
        name: 'searchChannelHistory',
        description: 'Search for messages in the channel that contain specific keywords',
        parameters: {
            type: 'object',
            properties: {
                keywords: {
                    type: 'string',
                    description: 'Keywords or phrases to search for'
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of messages to return (default: 10)'
                }
            },
            required: ['keywords']
        }
    },
    {
        name: 'getUserInfo',
        description: 'Get information about a Discord user by their ID or username',
        parameters: {
            type: 'object',
            properties: {
                userId: {
                    type: 'string',
                    description: 'The Discord user ID (snowflake)'
                },
                username: {
                    type: 'string',
                    description: 'The Discord username'
                }
            },
            oneOf: [
                { required: ['userId'] },
                { required: ['username'] }
            ]
        }
    },
    {
        name: 'getChannelInfo',
        description: 'Get information about the current Discord channel',
        parameters: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'searchUser',
        description: 'Search for users in the server by name or partial name',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The name or partial name to search for (minimum 2 characters)'
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of results to return (default: 5)',
                    minimum: 1,
                    maximum: 10
                }
            },
            required: ['query']
        }
    }
];

// Mapping of tool names to their implementation functions
const toolImplementations: { [key: string]: Function } = {
    fetchUserMessages,
    searchChannelHistory,
    getUserInfo,
    getChannelInfo,
    searchUser
};

// Function to execute a tool call
export async function executeToolCall(
    toolName: string,
    parameters: any,
    message: Message
): Promise<string> {
    try {
        if (toolName in toolImplementations) {
            return await toolImplementations[toolName](message, parameters);
        }
        return `Tool ${toolName} not implemented`;
    } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        return `Error executing tool ${toolName}: ${error}`;
    }
}