import { Message, AuditLogEvent, User } from 'discord.js';
import { ApiResponse } from '../types/api.types';
import ApiService from '../services/api';

// Define the tool details
export const AuditToolDetails = [
    {
        name: "getAuditLogs",
        description: "Get activity logs for a user in the server, e.g. deleted messages, role changes, etc.",
        input_schema: {
            type: "object",
            properties: {
                userId: {
                    type: "string",
                    description: "The user's Id, e.g. '1234567890'",
                },
                limit: {
                    type: "number",
                    description: "The number of audit logs to retrieve",
                }
            },
            required: ["userId"]
        }
    },
    {
        name: "getSeroLogs",
        description: "Get moderation logs of a user in the server, e.g. warnings, timeouts, bans, etc.",
        input_schema: {
            type: "object",
            properties: {
                userId: {
                    type: "string",
                    description: "The user's Id, e.g. '1234567890'",
                },
                limit: {
                    type: "number",
                    description: "The number of (audit) logs to retrieve",
                }
            },
            required: ["userId"]
        }
    },
    {
        name: "getSeroActivity",
        description: "Get activity logs of a user in the server, e.g. voice activity and username changes",
        input_schema: {
            type: "object",
            properties: {
                userId: {
                    type: "string",
                    description: "The user's Id, e.g. '1234567890'",
                },
                limit: {
                    type: "number",
                    description: "The number of (audit) logs to retrieve",
                }
            },
            required: ["userId"]
        }
    },
]

/**
 * Get audit logs for a user
 * @param message 
 * @param input - userId, limit
 */
export async function getAuditLogs(message: Message, input: object): Promise<string> {
    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    try {
        // Extract and validate input
        const { userId } = input as { userId: string };
        if (!userId) {
            return 'User ID is required';
        }

        // Get the user from the guild 
        const user = await message.guild.members.fetch(userId);
        if (!user) {
            return 'User not found';
        }

        // Get audit logs for the user (maximum 20)
        const auditLogs = await message.guild.fetchAuditLogs({
            user: user,
            limit: 20
        });

        if (!auditLogs.entries.size) {
            return 'No audit logs found';
        }

        // Format audit logs into readable format
        const formattedLogs = auditLogs.entries.map(entry => ({
            action: AuditLogEvent[entry.action],
            executor: entry.executor?.tag,
            target: entry.target instanceof User ? entry.target.tag : entry.targetId,
            reason: entry.reason || 'No reason provided',
            createdAt: entry.createdAt.toISOString()
        }));

        return JSON.stringify(formattedLogs, null, 2);

    } catch (error) {
        console.error('Error fetching audit logs:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Failed to find auditLog(s): ${errorMessage}`;
    }
}

/**
 * Get Sero logs for a specific user
 * @param message 
 * @param input 
 * @returns 
 */
export async function getSeroLogs(message: Message, input: object): Promise<string> {
    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    try {
        // Extract and validate input
        const { userId, limit = 10 } = input as { userId: string; limit: number };
        if (!userId) {
            return 'User ID is required';
        }

        // Get Sero logs for the user
        const sero_response = await ApiService.get(`/guilds/${message.guild.id}/logs/${userId}?limit=${limit}`) as ApiResponse;
        if (sero_response.status === 200 || sero_response.status === 201) {
            return JSON.stringify(sero_response.data, null, 2);
        } else {
            return `Failed to find Sero logs for user ${userId}`;
        }

    } catch (error) {
        console.error('Error sending DM:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Failed to find auditLog(s): ${errorMessage}`;
    }
}

/**
 * Get Sero activity for a specific user
 * @param message 
 * @param input 
 * @returns 
 */
export async function getSeroActivity(message: Message, input: object): Promise<string> {
    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    try {
        // Extract and validate input
        const { userId, limit = 10 } = input as { userId: string; limit: number };
        if (!userId) {
            return 'User ID is required';
        }

        // Get Sero logs for the user
        const sero_response = await ApiService.get(`/guilds/${message.guild.id}/activities/user/${userId}?limit=${limit}`) as ApiResponse;
        if (sero_response.status === 200 || sero_response.status === 201) {
            return JSON.stringify(sero_response.data, null, 2);
        } else {
            return `Failed to find Sero activity for user ${userId}`;
        }

    } catch (error) {
        console.error('Error sending DM:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Failed to find auditLog(s): ${errorMessage}`;
    }
}