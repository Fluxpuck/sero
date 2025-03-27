import { Message, User, AuditLogEvent } from "discord.js";
import { ClaudeTool } from "../types/tool.types";
import { findUser } from "../utils/user-resolver";
import { findChannel } from "../utils/channel-resolver";

import ApiService, { ApiResponse } from "../services/api";

type UserActionType = "sero-activity" | "sero-logs" | "auditlogs" | "voice-activity" | "message-count";
type UserToolInput = {
    user: string;
    channel: string;
    actions: UserActionType[];
    amount?: number;
    timeRange?: {
        before: string;
        after: string;
    };
};

export const DiscordUserToolContext = [
    {
        name: "discord_user_actions",
        description: "Tool for fetching various Discord user activities and logs",
        input_schema: {
            type: "object",
            properties: {
                user: {
                    type: "string",
                    description: "The username, user ID, or @mention to find"
                },
                channel: {
                    type: "string",
                    description: "The channel name, ID, or #mention to filter results (optional)"
                },
                actions: {
                    type: "array",
                    items: {
                        type: "string",
                        enum: ["sero-activity", "sero-logs", "auditlogs", "voice-activity"],
                        description: "Action type to perform: sero-activity (Get Sero activities), sero-logs (Get Sero logs), auditlogs (Get audit logs), voice-activity (Get voice activity)"
                    },
                    description: "List of actions to gather information about the user"
                },

                amount: {
                    type: "number",
                    description: "Amount of data to retrieve (optional)"
                },

                timeRange: {
                    type: "object",
                    properties: {
                        before: {
                            type: "string",
                            description: "End time for the data range"
                        },
                        after: {
                            type: "string",
                            description: "Start time for the data range"
                        }
                    },
                    description: "Time range for the data to retrieve (optional)"
                },

                auditlogType: {
                    type: "string",
                    description: "The type of audit log to retrieve (optional)",
                    enum: [],
                },

            },
            required: ["user", "actions"]
        }
    },
] as ClaudeTool[];

export async function DiscordUserTool(message: Message, input: UserToolInput): Promise<string> {
    if (!input.actions?.length) {
        return "At least one action must be specified";
    }

    if (input.amount && (input.amount < 1 || input.amount > 100)) {
        return "Amount must be between 1 and 100";
    }

    if (input.timeRange) {
        const before = new Date(input.timeRange.before);
        const after = new Date(input.timeRange.after);

        if (isNaN(before.getTime()) || isNaN(after.getTime())) {
            return "Invalid date format in timeRange";
        }

        if (before < after) {
            return "Before date must be later than after date";
        }
    }

    if (!message.guild) return "This command can only be used in a guild.";

    const user = await findUser(message.guild, input.user);
    if (!user) return `Could not find user "${input.user}"`;

    const channel = await findChannel(message.guild, input.channel);

    const actionPromises = input.actions.map(async (action) => {
        try {
            switch (action) {

                case "auditlogs":
                    const auditLogOptions: any = {
                        user: user,
                        limit: input.amount ?? 20
                    };

                    if (input.timeRange) {
                        if (input.timeRange.before) auditLogOptions.before = new Date(input.timeRange.before);
                        if (input.timeRange.after) auditLogOptions.after = new Date(input.timeRange.after);
                    }

                    const auditLogs = await user.guild.fetchAuditLogs(auditLogOptions);

                    // Format audit logs into readable format
                    const formattedLogs = auditLogs.entries.map(entry => ({
                        action: AuditLogEvent[entry.action],
                        executor: entry.executor?.tag,
                        target: entry.target instanceof User ? entry.target.tag : entry.targetId,
                        reason: entry.reason || 'No reason provided',
                        createdAt: entry.createdAt.toISOString()
                    }));

                    return formattedLogs.length > 0
                        ? `Audit Logs: ${formattedLogs.join(", ")}`
                        : `No audit logs found for user ${user.user.tag}`;

                case "sero-activity":
                    let activities: any[] = [];
                    const seroActivityResponse = await ApiService.get(`/guilds/${user.guild.id}/activities/user/${user.id}?limit=${input.amount ?? 20}`) as ApiResponse;

                    if (seroActivityResponse.status === 200 || seroActivityResponse.status === 201) {
                        activities = seroActivityResponse.data.filter((activity: any) =>
                            ["claim-exp-reward", "treasure-hunt", "daily-work", "transfer-exp"].includes(activity.type)
                        );
                    }

                    return activities.length > 0
                        ? `Sero Activity: ${activities.join(", ")}`
                        : `No Sero activities found for user ${user.user.tag}`;

                case "sero-logs":
                    const seroLogsResponse = await ApiService.get(`/guilds/${user.guild.id}/logs/${user.id}?limit=${input.amount ?? 20}`) as ApiResponse;

                    if (seroLogsResponse.status === 200 || seroLogsResponse.status === 201) {
                        return `Sero Logs: ${seroLogsResponse.data.join(", ")}`;
                    }

                    if (seroLogsResponse.status === 404) {
                        return `No Sero logs found for user ${user.user.tag}`;
                    }

                    break;

                case "voice-activity":
                    const voiceSessionResponse = await ApiService.get(`/guilds/${user.guild.id}/activities/user/${user.id}/voice-session?limit=${input.amount ?? 10}`) as ApiResponse;

                    if (voiceSessionResponse.status === 200 || voiceSessionResponse.status === 201) {
                        const filteredSessions = voiceSessionResponse.data
                            .filter((session: any) => !channel || session.channelId === channel.id)
                            .map((session: any) => ({
                                ...session,
                                durationInMinutes: Math.round(session.duration / 60)
                            }));

                        return filteredSessions.length > 0
                            ? `Voice-sessions: ${JSON.stringify(filteredSessions)}`
                            : `No voice sessions found in specified channel for ${user.user.tag}`;
                    }

                    break;

            }
        } catch (error) {
            return `No ${action} found for ${user.user.tag}`;
        }
    });

    const results = await Promise.all(actionPromises);
    return results.join("\n");
};
