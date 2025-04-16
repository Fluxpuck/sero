import { Client, Message, User, GuildMember, GuildChannel, AuditLogEvent, GuildAuditLogsEntry } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { UserResolver } from "../utils/user-resolver";
import { ChannelResolver } from "../utils/channel-resolver";
import { ApiService, ApiResponse } from "../services/api";

type UserActionType = "sero-activity" | "sero-logs" | "auditlogs" | "voice-activity" | "user-info";
type UserToolInput = {
    user: string;
    channel?: string;
    actions: UserActionType[];
    amount?: number;
    timeRange?: {
        before: string;
        after: string;
    };
    message_content?: string;
};

export class DiscordUserLogsTool extends ClaudeToolType {
    static getToolContext() {
        return {
            name: "discord_user_logs",
            description: "Tool for fetching various Discord user activities and logs",
            input_schema: {
                type: "object" as const,
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
                            enum: ["sero-activity", "sero-logs", "auditlogs", "voice-activity", "user-info"],
                            description: "Action type to perform: sero-activity (Get Sero activities), sero-logs (Get Sero logs), auditlogs (Get audit logs), voice-activity (Get voice activity), user-info (Details about the user)"
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
                    }
                },
                required: ["user", "actions"]
            }
        };
    }

    constructor(
        private readonly client: Client,
        private readonly message: Message,
        private readonly apiService: ApiService = new ApiService(),
    ) {
        super(DiscordUserLogsTool.getToolContext());
    }

    async execute(input: UserToolInput): Promise<string> {
        if (!this.message.guild) {
            return `Error: This command can only be used in a guild.`;
        }

        if (!this.message.member?.permissions.has('ModerateMembers')) {
            return `Error: You do not have permission to moderate members.`;
        }

        const user = await UserResolver.resolve(this.message.guild, input.user)
        if (!user) {
            return `Error: Could not find user "${input.user}"`;
        }

        const channel = input.channel ? await ChannelResolver.resolve(this.message.guild, input.channel) : this.message.channel;
        if (!channel) {
            return `Error: Could not find channel "${input.channel}"`;
        }

        const actionPromises = input.actions.map(action => this.handleAction(action, user, channel, input));
        const results = await Promise.all(actionPromises);
        return results.join("\n");
    }

    private async handleAction(action: UserActionType, user: GuildMember, channel: any, input: UserToolInput): Promise<string> {
        try {
            switch (action) {
                case "user-info":
                    return JSON.stringify(user.toJSON());

                case "auditlogs":
                    return await this.handleAuditLogs(user, input);

                case "sero-activity":
                    return await this.handleSeroActivity(user, input);

                case "sero-logs":
                    return await this.handleSeroLogs(user, input);

                case "voice-activity":
                    return await this.handleVoiceActivity(user, channel, input);

                default:
                    return `Unknown action: ${action}`;
            }
        } catch (error) {
            console.error(`Error on DiscordUserLogs:`, error);
            return `Failed to execute ${action} for ${user.user.tag}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }

    private async handleAuditLogs(user: GuildMember, input: UserToolInput): Promise<string> {
        const auditLogOptions: any = {
            user: user,
            limit: input.amount ?? 20
        };

        if (input.timeRange) {
            if (input.timeRange.before) auditLogOptions.before = new Date(input.timeRange.before);
            if (input.timeRange.after) auditLogOptions.after = new Date(input.timeRange.after);
        }

        const auditLogs = await user.guild.fetchAuditLogs(auditLogOptions);
        const formattedLogs = auditLogs.entries.map((entry: GuildAuditLogsEntry) => ({
            action: AuditLogEvent[entry.action],
            executor: entry.executor?.tag,
            target: entry.target instanceof User ? entry.target.tag : entry.targetId,
            reason: entry.reason || 'No reason provided',
            createdAt: entry.createdAt.toISOString()
        }));

        if (formattedLogs.length >= 1) {
            return `Audit Logs: ${JSON.stringify(formattedLogs)}`;
        } else {
            return `Couldn't find any Audit Logs for user ${user.user.tag}`;
        }
    }

    private async handleSeroActivity(user: GuildMember, input: UserToolInput): Promise<string> {
        const seroActivityResponse = await this.apiService.get(`/guilds/${user.guild.id}/activities/user/${user.id}?limit=${input.amount ?? 20}`) as ApiResponse;

        if (seroActivityResponse.status === 200 || seroActivityResponse.status === 201) {
            const activities = seroActivityResponse.data.filter((activity: any) =>
                ["claim-exp-reward", "treasure-hunt", "daily-work", "transfer-exp"].includes(activity.type)
            );

            return `Sero Activity: ${JSON.stringify(activities)}`;
        }
        return `Couldn't find any Sero activities for user ${user.user.tag}`;
    }

    private async handleSeroLogs(user: GuildMember, input: UserToolInput): Promise<string> {
        const seroLogsResponse = await this.apiService.get(`/guilds/${user.guild.id}/logs/${user.id}?limit=${input.amount ?? 20}`) as ApiResponse;

        if (seroLogsResponse.status === 200 || seroLogsResponse.status === 201) {
            return `Sero Logs: ${JSON.stringify(seroLogsResponse.data)}`;
        }
        return `No Sero logs found for user ${user.user.tag}`;
    }

    private async handleVoiceActivity(user: GuildMember, channel: any, input: UserToolInput): Promise<string> {
        const voiceSessionResponse = await this.apiService.get(`/guilds/${user.guild.id}/activities/user/${user.id}/voice-session?limit=${input.amount ?? 20}`) as ApiResponse;
        if (voiceSessionResponse.status === 200 || voiceSessionResponse.status === 201) {
            return `Voice Activity: ${JSON.stringify(voiceSessionResponse.data)}`;
        }
        return `Couldn't find any Voice Sessions for user ${user.user.tag}`;
    }
}

export const DiscordUserLogsToolContext = [
    DiscordUserLogsTool.getToolContext()
] as ClaudeTool[];
