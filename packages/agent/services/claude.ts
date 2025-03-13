import Anthropic from '@anthropic-ai/sdk';
import { Message } from 'discord.js';
import { toolsRegistry, executeToolCall } from '../tools';
import { getGuildName, getChannelName } from '../utils';

interface User {
    userId: string;
    username: string;
}

interface Guild {
    id: string;
    name: string;
}

// Define an interface for the context
interface UserContext {
    user: User;
    guild: Guild;
    conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>;
}

// Store user contexts in memory (consider using a database for persistence)
const userContexts = new Map<string, UserContext>();

const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

// Initialize the client with your API key
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Add these constants at the top of the file
const SYSTEM_PROMPT = `You are Sero Agent, a friendly and knowledgeable Discord assistant powered by Claude AI.
Your primary role is to help manage and enhance the Discord server experience.

Core traits:
- You are helpful but maintain appropriate boundaries
- You communicate in a clear, friendly manner
- You're knowledgeable about Discord, gaming, and technology
- You can be witty but always stay professional
- You prioritize server safety and following Discord guidelines

Available Tools:
{tools}

Tool Usage Guidelines:
1. Analyze user requests to determine if any tools would be helpful
2. Automatically use relevant tools without asking for permission
3. Use tool results to provide more informed and helpful responses
4. You can use multiple tools in a single response if needed
5. Don't reply with tool output only; always provide context and explanations
6. Don't mention the tool unless the user asks for more details

When using tools:
- For user search: Use searchUser to find and provide user information
- For user info: Use getUserInfo when context about a user is needed
- For message history: Use fetchUserMessages to get context from past conversations
- For channel search: Use searchChannelHistory to find relevant past discussions
- For channel info: Use getChannelInfo when channel context is needed

Important: Never pretend to be a human. You should always be clear that you are an AI assistant.
If you're unsure about something, say so rather than making assumptions.

Current context:
- Channel: {channelName}
- Server: {serverName}
- User: {username}`;

// Add this helper function after the imports
function sanitizeResponse(text: string): string {
    return text
        .replace(/@everyone/gi, 'everyone') // Replace everyone mentions
        .replace(/@here/gi, 'here') // Replace here mentions
        .replace(/@&\d+/g, ''); // Remove role mentions
}

// Update the askClaude function
export async function askClaude(user: User, prompt: string, message: Message): Promise<string> {
    try {
        // Get or initialize user context
        if (!userContexts.has(user.userId)) {
            userContexts.set(user.userId, {
                user,
                guild: { id: message.guild?.id ?? user.userId, name: getGuildName(message.guild) },
                conversationHistory: []
            });
        }

        const userContext = userContexts.get(user.userId)!;

        // Add the new message to conversation history
        userContext.conversationHistory.push({ role: 'user', content: prompt });

        // Keep only last 10 messages for context (adjust as needed)
        if (userContext.conversationHistory.length > 10) {
            userContext.conversationHistory = userContext.conversationHistory.slice(-10);
        }

        // Format tools information in a more structured way
        const toolsInfo = toolsRegistry.map(tool => {
            return `${tool.name}: ${tool.description}
            Parameters: ${JSON.stringify(tool.parameters, null, 2)}`;
        }).join('\n\n');

        // Prepare system prompt with real-time context
        const systemPrompt = SYSTEM_PROMPT
            .replace('{tools}', toolsInfo)
            .replace('{channelName}', getChannelName(message.channel))
            .replace('{serverName}', getGuildName(message.guild))
            .replace('{username}', user.username);

        const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 1000, // Increased to allow for tool usage
            system: systemPrompt,
            messages: userContext.conversationHistory,
        });

        // Process the response and handle tool calls
        const textBlock = response.content.find(block => block.type === 'text');
        if (!textBlock || !('text' in textBlock)) {
            return "No text response received";
        }

        let responseText = sanitizeResponse(textBlock.text);
        let finalResponse = responseText;

        // Enhanced tool call processing
        const toolCallRegex = /@tool\[(.*?)\]\((.*?)\)/g;
        const toolCalls = responseText.match(toolCallRegex);

        if (toolCalls) {
            for (const toolCall of toolCalls) {
                const [_, toolName, paramsStr] = /@tool\[(.*?)\]\((.*?)\)/.exec(toolCall) || [];
                if (toolName) {
                    try {
                        const params = JSON.parse(paramsStr);
                        const toolResult = await executeToolCall(toolName, params, message);

                        // Sanitize tool result as well
                        const sanitizedResult = sanitizeResponse(toolResult);

                        // Add sanitized tool result to conversation history
                        userContext.conversationHistory.push({
                            role: 'assistant',
                            content: `Tool ${toolName} returned: ${sanitizedResult}`
                        });

                        // Replace tool call with sanitized result
                        finalResponse = finalResponse.replace(toolCall, sanitizedResult);
                    } catch (error) {
                        console.error(`Error executing tool ${toolName}:`, error);
                        finalResponse = finalResponse.replace(
                            toolCall,
                            `[Error executing ${toolName}]`
                        );
                    }
                }
            }
        }

        // Store sanitized response in context
        userContext.conversationHistory.push({
            role: 'assistant',
            content: finalResponse
        });

        return finalResponse;
    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw error;
    }
}
