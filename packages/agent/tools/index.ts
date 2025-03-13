// src/tools/index.ts - Tools registry and executor
import { Message } from 'discord.js';
import { findUser } from './find-user';

// Define tool schemas
export const toolsRegistry = [
    {
        name: 'findUser',
        description: 'Find and retrieve information about Discord users',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The user ID or username to search for (minimum 2 characters)',
                    examples: [
                        '123456789123456789',  // User ID
                        'john',                // Full username
                        'jo',                  // Partial match
                        'John Smith'           // Display name
                    ]
                }
            },
            required: ['query']
        },
        useCase: [
            'Looking up user details by ID or username',
            'Finding users with partial name matches',
            'Getting user roles and join dates',
            'Retrieving user avatar URLs'
        ],
        examples: [
            {
                description: 'Find user by ID',
                usage: '@tool[findUser]({"query": "123456789123456789"})',
                result: '### User Found: JohnDoe\n**Username**: john_doe\n**ID**: `123456789123456789`'
            },
            {
                description: 'Find user by username',
                usage: '@tool[findUser]({"query": "john"})',
                result: '### User Found: John Smith\n**Username**: john_smith\n**ID**: `987654321987654321`'
            },
            {
                description: 'Find user by partial name',
                usage: '@tool[findUser]({"query": "jo"})',
                result: '### User Found: Joe Developer\n**Username**: joe_dev\n**ID**: `111222333444555666`'
            }
        ],
    }
];

interface ToolExample {
    description: string;
    usage: string;
    result?: string;
}

interface ToolContext {
    name: string;
    description: string;
    useCase: string[];
    examples: ToolExample[];
    parameters: {
        type: string;
        properties: {
            [key: string]: {
                type: string;
                description: string;
                examples?: string[];
            };
        };
        required: string[];
    };
}

// Simple error type
class ToolError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ToolError';
    }
}

// Mapping of tool names to their implementation functions
const toolImplementations: { [key: string]: Function } = {
    findUser,
};

// Simplified execute function
export async function executeToolCall(
    toolName: string,
    parameters: unknown,
    message: Message
): Promise<string> {
    try {
        if (!(toolName in toolImplementations)) {
            return `Tool "${toolName}" not implemented`;
        }

        return await toolImplementations[toolName](message, parameters);
    } catch (error) {
        return `Error executing tool ${toolName}: ${error instanceof Error ? error.message : String(error)}`;
    }
}

// Helper function to get context for a specific tool
export function getToolContext(toolName: string): ToolContext | undefined {
    return toolsRegistry.find(tool => tool.name === toolName);
}

// Helper function to format tool information
export function formatToolInfo(tool: typeof toolsRegistry[0]): string {
    return `## ${tool.name}
${tool.description}

**Use Cases:**
${tool.useCase.map(use => `- ${use}`).join('\n')}

**Parameters:**
- ${Object.entries(tool.parameters.properties).map(([name, prop]) =>
        `${name} (${prop.type}): ${prop.description}`
    ).join('\n- ')}

**Example:**
${tool.examples[0].description}
Input: \`${tool.examples[0].usage}\`
Output: ${tool.examples[0].result}`;
}
