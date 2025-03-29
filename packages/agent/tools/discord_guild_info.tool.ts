import { Client, Message, GuildChannel, Role, CategoryChannel } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { ChannelResolver } from "../utils/channel-resolver";
import { UserResolver } from "../utils/user-resolver";

type GuildInfoActionType = "channel-info" | "category-channels" | "role-info" | "add-role" | "remove-role";

interface GuildInfoInput {
    action: GuildInfoActionType;
    channel?: string;
    category?: string;
    role?: string;
    user?: string;
}

export class DiscordGuildInfoTool extends ClaudeToolType {
    static getToolContext() {
        return {
            name: "discord_guild_info",
            description: "Get information about Discord guild elements and manage roles",
            input_schema: {
                type: "object" as const,
                properties: {
                    action: {
                        type: "string",
                        enum: ["channel-info", "category-channels", "role-info", "add-role", "remove-role"],
                        description: "Type of guild info action to perform"
                    },
                    channel: {
                        type: "string",
                        description: "Channel name or ID to get information about"
                    },
                    category: {
                        type: "string",
                        description: "Category name or ID to list channels from"
                    },
                    role: {
                        type: "string",
                        description: "Role name or ID to find or manage"
                    },
                    user: {
                        type: "string",
                        description: "User to add/remove role from (required for role management actions)"
                    }
                },
                required: ["action"]
            }
        };
    }

    constructor(
        private readonly client: Client,
        private readonly message: Message,
    ) {
        super(DiscordGuildInfoTool.getToolContext());
    }

    private async findRole(query: string): Promise<Role | null> {
        const guild = this.message.guild!;

        // Try to find by ID first
        if (/^\d+$/.test(query)) {
            try {
                return await guild.roles.fetch(query) || null;
            } catch {
                // Continue to name search if ID lookup fails
            }
        }

        // Search by name (case-insensitive)
        const searchName = query.toLowerCase();
        return guild.roles.cache.find(role =>
            role.name.toLowerCase() === searchName ||
            role.name.toLowerCase().includes(searchName)
        ) || null;
    }

    async execute(input: GuildInfoInput): Promise<string> {
        if (!this.message.guild) {
            return `This command can only be used in a guild.`;
        }

        try {
            switch (input.action) {
                case "channel-info": {
                    const channel = await ChannelResolver.resolve(this.message.guild, input.channel!);
                    if (!channel) return `Channel "${input.channel}" not found`;
                    return JSON.stringify(ChannelResolver.formatChannel(channel), null, 2);
                }

                case "category-channels": {
                    const category = await ChannelResolver.resolve(this.message.guild, input.category!);
                    if (!category || !(category instanceof CategoryChannel)) {
                        return `Category "${input.category}" not found`;
                    }

                    const children = category.children.cache.map(channel =>
                        ChannelResolver.formatChannel(channel)
                    );
                    return JSON.stringify({
                        category: ChannelResolver.formatChannel(category),
                        channels: children
                    }, null, 2);
                }

                case "role-info": {
                    const role = await this.findRole(input.role!);
                    if (!role) return `Role "${input.role}" not found`;

                    return JSON.stringify({
                        id: role.id,
                        name: role.name,
                        color: role.hexColor,
                        position: role.position,
                        permissions: role.permissions.toArray(),
                        mentionable: role.mentionable,
                        managed: role.managed,
                        memberCount: role.members.size
                    }, null, 2);
                }

                case "add-role":
                case "remove-role": {
                    if (!this.message.member?.permissions.has('ManageRoles')) {
                        return "You don't have permission to manage roles";
                    }

                    const role = await this.findRole(input.role!);
                    if (!role) return `Role "${input.role}" not found`;

                    const member = await UserResolver.resolve(this.message.guild, input.user!);
                    if (!member) return `User "${input.user}" not found`;

                    if (input.action === "add-role") {
                        await member.roles.add(role);
                        return `Added role ${role.name} to ${member.user.tag}`;
                    } else {
                        await member.roles.remove(role);
                        return `Removed role ${role.name} from ${member.user.tag}`;
                    }
                }

                default:
                    return `Unknown action: ${input.action}`;
            }
        } catch (error) {
            throw new Error(`Failed to execute ${input.action}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const DiscordGuildInfoToolContext = [
    DiscordGuildInfoTool.getToolContext()
] as ClaudeTool[];