import { Message } from "discord.js";
import { ClaudeTool } from "../types/tool.types";
import { findUser } from "../utils/user-resolver";

type ModerationActionType = "timeout" | "disconnect" | "kick" | "ban" | "warn";
type ModerationToolInput = {
    user: string;
    actions: ModerationActionType[];
    timeout_duration?: number;
    reason: string;
};

export const DiscordModerationToolContext = [
    {
        name: "discord_moderation_actions",
        description: "Find and optionally moderate a Discord user with various actions",
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
                        description: "Type of moderation action to perform",
                        enum: ["timeout", "disconnect", "kick", "ban", "warn"]
                    },
                    description: "Array of optional moderation actions to perform on the user"
                },
                timeout_duration: {
                    type: "number",
                    description: "Duration in minutes for timeout (ignored for other actions)"
                },
                reason: {
                    type: "string",
                    description: "Reason for the moderation actions"
                },
            },
            required: ["user", "actions"]
        }
    },
] as ClaudeTool[];

export async function DiscordModerationTool(message: Message, input: ModerationToolInput): Promise<string> {
    if (!message.guild) return "This command can only be used in a guild.";

    const user = await findUser(message.guild, input.user);
    if (!user) return `Could not find user "${input.user}"`;

    const reason = `${input.reason} - Moderator: ${message.author.tag}`;
    const warning = `# You've received a warning!\n⚠️ ${reason}\n\n-# ${message.guild.name}`;

    const actionPromises = input.actions.map(async (action) => {
        try {
            switch (action) {
                case "timeout":
                    if (input.timeout_duration) {
                        await user.timeout(input.timeout_duration * 60 * 1000, reason);
                        return `Timed out ${user.user.tag} for ${input.timeout_duration} minutes`;
                    }
                    return "Timeout duration not specified";
                case "disconnect":
                    if (user.voice.channel) {
                        await user.voice.disconnect(reason);
                        return `Disconnected ${user.user.tag} from voice`;
                    }
                    return `${user.user.tag} is not in a voice channel`;
                case "kick":
                    await user.kick(reason);
                    return `Kicked ${user.user.tag}`;
                case "ban":
                    await user.ban({ deleteMessageSeconds: 24 * 60 * 60, reason: reason });
                    return `Banned ${user.user.tag}`;
                case "warn":
                    await user.send(warning);
                    return `Warned ${user.user.tag}`;
            }
        } catch (error) {
            return `Failed to ${action} ${user.user.tag}: ${error}`;
        }
    });

    const results = await Promise.all(actionPromises);
    return results.join("\n");
};
