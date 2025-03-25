import { Message } from "discord.js";
import { ClaudeTool } from "../types/tool.types";
import { findUser } from "../utils/user-resolver";

type GuildActionType = "timeout" | "disconnect" | "kick" | "ban" | "warn";
type GuildToolInput = {
    user: string;
    actions: GuildActionType[];
    timeout_duration?: number;
    reason: string;
};

export const DiscordGuildToolContext = [
    {
        name: "discord_guild_actions",
        description: "",
        input_schema: {
            type: "object",
            properties: {
                user: {
                    type: "string",
                    description: "The username or user ID to find"
                },
                actions: {
                    type: "array",
                    items: {
                        type: "string",
                        description: "Type of guild action to perform",
                        enum: ["timeout", "disconnect", "kick", "ban", "warn"]
                    },
                    description: "Array of optional moderation actions to perform on the user"
                },
                event: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Name of the event"
                            },
                            description: {
                                type: "string",
                                description: "Description of the event"
                            },
                            duration: {
                                type: "integer",
                                description: "Duration of the event in minutes"
                            },
                            location: {
                                type: "string",
                                description: "Location where the event will take place"
                            },
                            startTime: {
                                type: "string",
                                description: "Start time of the event in ISO 8601 format"
                            }
                        },
                        required: ["name", "description", "duration", "location", "startTime"]
                    },
                    description: "Array of events with details"
                }
            },
            required: ["user", "actions"]
        }
    },
] as ClaudeTool[];

export async function DiscordGuildTool(message: Message, input: GuildToolInput): Promise<string> {
    if (!message.guild) return "This command can only be used in a guild.";

    const user = await findUser(message.guild, input.user);
    if (!user) return `Could not find user "${input.user}"`;

    const actionPromises = input.actions.map(async (action) => {
        try {
            switch (action) {
                default:
                    break;
            }
        } catch (error) {
            return `Failed to ${action} ${user.user.tag}: ${error}`;
        }
    });

    const results = await Promise.all(actionPromises);
    return results.join("\n");
};
