import { Message, User, GuildChannel, AuditLogEvent } from "discord.js";
import { findUser } from "../utils/user-resolver";
import { findChannel } from "../utils/channel-resolver";

import ApiService, { ApiResponse } from "../services/api";

type InformationType =
    "messageCount" | "auditLogs" | "seroLogs" | "seroActivity" | null;
type UserInformationTool = {
    user: string; // User e.g. '1234567890' or 'username'
    channels: string[]; // Channel e.g. '1234567890' or 'channelname'
    actions: InformationType[]; // Array of information actions to perform
    limit?: number; // Limit of logs to fetch
};

export async function userInformation(message: Message, input: UserInformationTool): Promise<string> {

    // Step 1: Find the user
    const user = await findUser(message.guild!, input.user);
    if (!user) {
        return "User not found";
    }

    // Step 2: Find the channels
    let channels: GuildChannel[] = [];
    if (input.channels && input.channels.length > 0) {
        channels = await Promise.all(
            input.channels.map(async (channel) => {
                const foundChannel = await findChannel(message.guild!, channel);
                if (!foundChannel) throw new Error(`Channel ${channel} not found`);
                return foundChannel;
            })
        );
    }

    // Step 3: Perform information actions
    const result: any = [];

    try {
        await Promise.all(input.actions.map(async (action) => {
            switch (action) {

                // Fetch message count for the user
                case "messageCount":
                    // Not yet implemented
                    break;

                // Fetch audit logs for the user
                case "auditLogs":
                    const auditLogs = await user.guild.fetchAuditLogs({
                        user: user,
                        limit: input.limit ?? 10
                    });

                    // Format audit logs into readable format
                    const formattedLogs = auditLogs.entries.map(entry => ({
                        action: AuditLogEvent[entry.action],
                        executor: entry.executor?.tag,
                        target: entry.target instanceof User ? entry.target.tag : entry.targetId,
                        reason: entry.reason || 'No reason provided',
                        createdAt: entry.createdAt.toISOString()
                    }));

                    result.push(`Audit Logs: ${JSON.stringify(formattedLogs)}`);
                    break;

                // Fetch sero logs for the user
                case "seroLogs":
                    const seroLogsResponse = await ApiService.get(`/guilds/${user.guild.id}/logs/${user.id}?limit=${input.limit ?? 10}`) as ApiResponse;
                    if (seroLogsResponse.status === 200 || seroLogsResponse.status === 201) {
                        result.push(`Sero Logs: ${JSON.stringify(seroLogsResponse.data)}`);
                    } else if (seroLogsResponse.status === 404) {
                        result.push(`Sero Logs: No logs found for user ${user.user.tag}`);
                    } else {
                        throw new Error(`Failed to find Sero logs for user ${user.user.tag}`);
                    }
                    break;

                // Fetch sero activity for the user
                case "seroActivity":
                    const seroActivtyResponse = await ApiService.get(`/guilds/${user.guild.id}/activities/user/${user.id}?limit=${input.limit ?? 10}`) as ApiResponse;
                    if (seroActivtyResponse.status === 200 || seroActivtyResponse.status === 201) {
                        result.push(`Sero Activity: ${JSON.stringify(seroActivtyResponse.data)}`);
                    } else if (seroActivtyResponse.status === 404) {
                        result.push(`Sero Activity: No activity found for user ${user.user.tag}`);
                    } else {
                        throw new Error(`Failed to find Sero activity for user ${user.user.tag}`);
                    }
                    break;
            }
        }));

        return `
            User Information: ${JSON.stringify(user.toJSON())}
            ${input.channels ? `Channel Information: ${channels.join('; ')}` : ""}
            Additional information: ${result.join("; ")}
        `;

    } catch (error: any) {
        console.error(`Error executing moderation actions:`, error);
        return `
            User Information: ${JSON.stringify(user.toJSON())}
            ${result.length > 0 ? `Additional information: ${result.join("; ")}` : ""}
            Actions Failed: ${error.message}
        `;
    }
}