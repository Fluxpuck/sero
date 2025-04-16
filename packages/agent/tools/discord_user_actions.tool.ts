import { Client, Message, GuildMember } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { UserResolver } from "../utils/user-resolver";
import { ApiService } from "../services/api";

type UserActionType = "add-role" | "remove-role" | "change-nickname";
type UserActionToolInput = {
    user: string;
    actions: UserActionType[];
    role?: string;
    nickname?: string;
    reason?: string;
};

export class DiscordUserActionsTool extends ClaudeToolType {
    static getToolContext() {
        return {
            name: "discord_user_actions",
            description: "Manage Discord user roles and nicknames",
            input_schema: {
                type: "object" as const,
                properties: {
                    user: {
                        type: "string",
                        description: "The username, user ID, or @mention to perform actions on"
                    },
                    actions: {
                        type: "array",
                        items: {
                            type: "string",
                            enum: ["add-role", "remove-role", "change-nickname"],
                            description: "Type of user action to perform"
                        },
                        description: "Array of actions to perform on the user: Add Role, Remove Role, Change Nickname"
                    },
                    role: {
                        type: "string",
                        description: "Role name or ID to add or remove from the user (required for role actions)"
                    },
                    nickname: {
                        type: "string",
                        description: "New nickname for the user (required for change-nickname action)"
                    },
                    reason: {
                        type: "string",
                        description: "Reason for the action (optional)"
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
        super(DiscordUserActionsTool.getToolContext());
    }

    async execute(input: UserActionToolInput): Promise<string> {
        if (!this.message.guild) {
            return `Error: This command can only be used in a guild.`;
        }

        if (!this.message.member?.permissions.has('ManageRoles')) {
            return `Error: You do not have permission to manage user roles or nicknames.`;
        }

        const user = await UserResolver.resolve(this.message.guild, input.user);
        if (!user) {
            return `Error: Could not find user "${input.user}"`;
        }

        const actionPromises = input.actions.map(action => this.handleAction(action, user, input));
        const results = await Promise.all(actionPromises);
        return results.filter(result => result).join("\n");
    }

    private async handleAction(action: UserActionType, user: GuildMember, input: UserActionToolInput): Promise<string> {
        try {
            const fullReason = input.reason ? `${input.reason} - Moderator: ${this.message.author.tag}` : `Applied by ${this.message.author.tag}`;

            switch (action) {
                case "add-role":
                    return await this.handleAddRole(user, input.role!, fullReason);

                case "remove-role":
                    return await this.handleRemoveRole(user, input.role!, fullReason);

                case "change-nickname":
                    return await this.handleChangeNickname(user, input.nickname!, fullReason);

                default:
                    return `Unknown action: ${action}`;
            }
        } catch (error) {
            console.error(`Failed to execute ${action} for ${user.user.tag}:`, error);
            return `Failed to ${action} ${user.user.tag}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }

    private async handleAddRole(user: GuildMember, roleName: string, reason: string): Promise<string> {
        if (!roleName) {
            return "Role name is required for add-role action";
        }

        // Find role by name or ID
        const role = this.message.guild!.roles.cache.find(r =>
            r.id === roleName ||
            r.name.toLowerCase() === roleName.toLowerCase() ||
            r.name.toLowerCase().includes(roleName.toLowerCase())
        );

        if (!role) {
            return `Role "${roleName}" not found`;
        }

        // Check if bot can manage this role
        if (!role.editable) {
            return `Cannot add role "${role.name}" as it's higher than my highest role`;
        }

        // Add role to user
        await user.roles.add(role, reason);
        return `Added role "${role.name}" to ${user.user.tag}`;
    }

    private async handleRemoveRole(user: GuildMember, roleName: string, reason: string): Promise<string> {
        if (!roleName) {
            return "Role name is required for remove-role action";
        }

        // Find role by name or ID
        const role = this.message.guild!.roles.cache.find(r =>
            r.id === roleName ||
            r.name.toLowerCase() === roleName.toLowerCase() ||
            r.name.toLowerCase().includes(roleName.toLowerCase())
        );

        if (!role) {
            return `Role "${roleName}" not found`;
        }

        // Check if user has the role
        if (!user.roles.cache.has(role.id)) {
            return `User ${user.user.tag} doesn't have role "${role.name}"`;
        }

        // Check if bot can manage this role
        if (!role.editable) {
            return `Cannot remove role "${role.name}" as it's higher than my highest role`;
        }

        // Remove role from user
        await user.roles.remove(role, reason);
        return `Removed role "${role.name}" from ${user.user.tag}`;
    }

    private async handleChangeNickname(user: GuildMember, nickname: string, reason: string): Promise<string> {
        if (!nickname && nickname !== '') {
            return "Nickname is required for change-nickname action";
        }

        // Check if bot can change nickname
        if (!user.manageable) {
            return `Cannot change nickname of ${user.user.tag} as they have higher permissions`;
        }

        // Change nickname
        const previousNickname = user.displayName;
        await user.setNickname(nickname, reason);

        if (nickname === '') {
            return `Reset nickname for ${user.user.tag} (was "${previousNickname}")`;
        } else {
            return `Changed nickname for ${user.user.tag} to "${nickname}" (was "${previousNickname}")`;
        }
    }
}

export const DiscordUserActionsToolContext = [
    DiscordUserActionsTool.getToolContext()
] as ClaudeTool[];