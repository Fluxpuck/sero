import { Client, Message } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { UserResolver } from "../utils/user-resolver";

type ModerationActionType = "timeout" | "disconnect" | "kick" | "ban" | "warn" | "nickname";
type ModerationToolInput = {
    user: string;
    actions: ModerationActionType[];
    timeout_duration?: number;
    reason: string;
    nickname?: string;
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
                            enum: ["timeout", "disconnect", "kick", "ban", "warn", "nickname"]
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
                    nickname: {
                        type: "string",
                        description: "New nickname for the user (ignored for other actions)"
                    }
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

    async execute({ user: targetUser, actions, timeout_duration, reason, nickname }: ModerationToolInput): Promise<string> {
        if (!this.message.guild) {
            return `Error: This command can only be used in a guild.`;
        }

        if (!this.message.member?.permissions.has('ModerateMembers')) {
            return `Error: This user does not have permission to moderate members.`;
        }

        const user = await UserResolver.resolve(this.message.guild, targetUser);
        if (!user) {
            return `Error: Could not find user "${targetUser}."`;
        }
        if (!user.moderatable) {
            return `Error: Unable to moderate user "${user.user.tag}". Reason: User has higher permissions or role hierarchy prevents moderation.`;
        }

        const fullReason = `${reason} - Moderator: ${this.message.author.tag}`;
        const warning = `# You've received a warning!\n⚠️ ${reason}\n\n-# ${this.message.guild.name}`;

        const newNickname = nickname || user.displayName;

        const actionPromises = actions.map(async (action) => {
            try {
                switch (action) {
                    case "timeout":
                        if (timeout_duration) {
                            await user.timeout(timeout_duration * 60 * 1000, fullReason).catch((error) => {
                                return `Error: Failed to timeout user "${user.user.tag}". Reason: ${error}`;
                            });
                            return `Timed out ${user.user.tag} for ${timeout_duration} minutes`;
                        }
                        return "Timeout duration not specified";

                    case "disconnect":
                        if (user.voice.channel) {
                            await user.voice.disconnect(fullReason).catch((error) => {
                                return `Error: Failed to disconnect user "${user.user.tag}". Reason: ${error}`;
                            });
                            return `Disconnected ${user.user.tag} from voice`;
                        }
                        return `${user.user.tag} is not in a voice channel`;

                    case "kick":
                        if (!this.message.member?.permissions.has('KickMembers')) {
                            return `This user does not have permission to kick members.`;
                        }
                        if (!user.kickable) {
                            return `This user is not kickable.`;
                        }
                        await user.kick(fullReason).catch((error) => {
                            return `Error: Failed to kick user "${user.user.tag}". Reason: ${error}`;
                        });
                        return `Kicked ${user.user.tag}`;

                    case "ban":
                        if (!this.message.member?.permissions.has('BanMembers')) {
                            return `This user does not have permission to ban members.`;
                        }
                        if (!user.bannable) {
                            return `This user is not bannable.`;
                        }
                        await user.ban({ deleteMessageSeconds: 24 * 60 * 60, reason: fullReason }).catch((error) => {
                            return `Error: Failed to ban user "${user.user.tag}". Reason: ${error}`;
                        });
                        return `Banned ${user.user.tag}`;

                    case "warn":
                        await user.send(warning).catch((error) => {
                            return `Error: Failed to send warning to user "${user.user.tag}". Their DMs are most likely disabled.`;
                        });
                        return `Warned ${user.user.tag}`;

                    case "nickname":
                        if (!this.message.member?.permissions.has('ManageNicknames')) {
                            return `This user does not have permission to change nicknames.`;
                        }
                        if (!user.manageable) {
                            return `This user is not manageable.`;
                        }
                        await user.setNickname(newNickname, fullReason).catch((error) => {
                            return `Error: Failed to change nickname for user "${user.user.tag}". Reason: ${error}`;
                        });
                        return `Changed nickname for ${user.user.tag} to ${newNickname}`;

                    default:
                        return `Unknown action: ${action}`;
                }
            } catch (error) {
                console.error(`Error on DiscordModerationTool:`, error);
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
