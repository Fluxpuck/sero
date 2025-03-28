import { Client, Message } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { findUser } from "../utils/user-resolver";

type ModerationActionType = "timeout" | "disconnect" | "kick" | "ban" | "warn";
type ModerationToolInput = {
    user: string;
    actions: ModerationActionType[];
    timeout_duration?: number;
    reason: string;
};

export class DiscordModerationTool extends ClaudeToolType {
    static getToolContext() {
        return {
            name: "discord_moderation_actions",
            description: "Find and optionally moderate a Discord user with various actions",
            input_schema: {
                type: "object" as const,
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
                        description: "Array of optional moderation actions to perform on the user: Timeout (mute), Disconnect (from voice), Kick, Ban, Warn"
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
                required: ["user", "actions", "reason"]
            },
        };
    }

    constructor(
        private readonly client: Client,
        private readonly message: Message,
    ) {
        super(DiscordModerationTool.getToolContext());
    }

    async execute({ user: targetUser, actions, timeout_duration, reason }: ModerationToolInput): Promise<string> {
        if (!this.message.guild) {
            throw new Error("This command can only be used in a guild.");
        }

        const user = await findUser(this.message.guild, targetUser);
        if (!user) {
            throw new Error(`Could not find user "${targetUser}"`);
        }

        const fullReason = `${reason} - Moderator: ${this.message.author.tag}`;
        const warning = `# You've received a warning!\n⚠️ ${reason}\n\n-# ${this.message.guild.name}`;

        const actionPromises = actions.map(async (action) => {
            try {
                switch (action) {
                    case "timeout":
                        if (timeout_duration) {
                            await user.timeout(timeout_duration * 60 * 1000, fullReason);
                            return `Timed out ${user.user.tag} for ${timeout_duration} minutes`;
                        }
                        return "Timeout duration not specified";
                    case "disconnect":
                        if (user.voice.channel) {
                            await user.voice.disconnect(fullReason);
                            return `Disconnected ${user.user.tag} from voice`;
                        }
                        return `${user.user.tag} is not in a voice channel`;
                    case "kick":
                        await user.kick(fullReason);
                        return `Kicked ${user.user.tag}`;
                    case "ban":
                        await user.ban({ deleteMessageSeconds: 24 * 60 * 60, reason: fullReason });
                        return `Banned ${user.user.tag}`;
                    case "warn":
                        await user.send(warning);
                        return `Warned ${user.user.tag}`;
                    default:
                        return `Unknown action: ${action}`;
                }
            } catch (error) {
                throw new Error(`Failed to ${action} ${user.user.tag}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });

        const results = await Promise.all(actionPromises);
        return results.join("\n");
    }
}

export const DiscordModerationToolContext = [
    DiscordModerationTool.getToolContext()
] as ClaudeTool[];
