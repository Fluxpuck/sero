import { Client, Message, GuildChannel, Role, CategoryChannel, Guild, GuildScheduledEvent, ChannelType } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { ChannelResolver } from "../utils/channel-resolver";
import { UserResolver } from "../utils/user-resolver";

type GuildInfoActionType =
    "guild-info" |
    "channel-info" |
    "list-channels" |
    "role-info" |
    "list-events" |
    "event-info";

interface GuildInfoInput {
    action: GuildInfoActionType;
    channel?: string;
    category?: string;
    role?: string;
    event?: string;
}

export class DiscordGuildInfoTool extends ClaudeToolType {
    static getToolContext() {
        return {
            name: "discord_guild_info",
            description: "Get information about Discord guild elements",
            input_schema: {
                type: "object" as const,
                properties: {
                    action: {
                        type: "string",
                        enum: [
                            "guild-info",
                            "channel-info",
                            "list-channels",
                            "role-info",
                            "list-events",
                            "event-info"
                        ],
                        description: "Type of guild info action to perform"
                    },
                    channel: {
                        type: "string",
                        description: "Channel name or ID to get information about"
                    },
                    category: {
                        type: "string",
                        description: "Optional category name or ID to filter channels when listing"
                    },
                    role: {
                        type: "string",
                        description: "Role name or ID to find information about"
                    },
                    event: {
                        type: "string",
                        description: "Event ID to get information about"
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

    private async findEvent(query: string): Promise<GuildScheduledEvent | null> {
        const guild = this.message.guild!;

        // Try to find by ID first
        if (/^\d+$/.test(query)) {
            try {
                return await guild.scheduledEvents.fetch(query) || null;
            } catch {
                // Continue to name search if ID lookup fails
            }
        }

        // Search by name (case-insensitive)
        const searchName = query.toLowerCase();
        return (await guild.scheduledEvents.fetch()).find(event =>
            event.name.toLowerCase() === searchName ||
            event.name.toLowerCase().includes(searchName)
        ) || null;
    }

    private formatGuild(guild: Guild): any {
        return {
            id: guild.id,
            name: guild.name,
            ownerId: guild.ownerId,
            description: guild.description,
            memberCount: guild.memberCount,
            verified: guild.verified,
            partnered: guild.partnered,
            preferredLocale: guild.preferredLocale,
            premiumTier: guild.premiumTier,
            premiumSubscriptionCount: guild.premiumSubscriptionCount,
            createdAt: guild.createdAt.toISOString(),
            features: guild.features,
            channelCount: guild.channels.cache.size,
            roleCount: guild.roles.cache.size,
            emojiCount: guild.emojis.cache.size,
            stickerCount: guild.stickers.cache.size
        };
    }

    private formatEvent(event: GuildScheduledEvent): any {
        return {
            id: event.id,
            name: event.name,
            description: event.description,
            scheduledStartTime: event.scheduledStartAt?.toISOString(),
            scheduledEndTime: event.scheduledEndAt?.toISOString(),
            status: event.status,
            creatorId: event.creatorId,
            createdAt: event.createdAt?.toISOString(),
            entityType: event.entityType,
            entityId: event.entityId,
            channelId: event.channelId,
            location: event.entityMetadata?.location,
            userCount: event.userCount
        };
    }

    async execute(input: GuildInfoInput): Promise<string> {
        if (!this.message.guild) {
            return `Error: This command can only be used in a guild.`;
        }

        try {
            switch (input.action) {
                case "guild-info": {
                    return JSON.stringify(this.formatGuild(this.message.guild), null, 2);
                }

                case "channel-info": {
                    const channel = await ChannelResolver.resolve(this.message.guild, input.channel!);
                    if (!channel) return `Channel "${input.channel}" not found`;
                    return JSON.stringify(ChannelResolver.formatChannel(channel), null, 2);
                }

                case "list-channels": {
                    let channels = this.message.guild.channels.cache;
                    let categoryName = '';

                    // Filter by category if specified
                    if (input.category) {
                        const category = await ChannelResolver.resolve(this.message.guild, input.category);
                        if (!category || !(category instanceof CategoryChannel)) {
                            return `Category "${input.category}" not found`;
                        }

                        channels = category.children.cache;
                        categoryName = category.name;
                    }

                    const formattedChannels = channels
                        .map(channel => ({
                            id: channel.id,
                            name: channel.name,
                            type: channel.type,
                            parentId: channel.parentId,
                            position: 'position' in channel ? channel.position : 0,
                        }))
                        .sort((a, b) => a.position - b.position);

                    return JSON.stringify({
                        count: formattedChannels.length,
                        categoryFilter: input.category ? categoryName : null,
                        channels: formattedChannels
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

                case "list-events": {
                    const events = await this.message.guild.scheduledEvents.fetch();
                    return JSON.stringify({
                        count: events.size,
                        events: Array.from(events.values()).map(event => this.formatEvent(event))
                    }, null, 2);
                }

                case "event-info": {
                    if (!input.event) return "Event ID or name is required";
                    const event = await this.findEvent(input.event);
                    if (!event) return `Event "${input.event}" not found`;
                    return JSON.stringify(this.formatEvent(event), null, 2);
                }

                default:
                    return `Unknown action: ${input.action}`;
            }
        } catch (error) {
            console.error(`Error on DiscordGuildInfoTool:`, error);
            throw new Error(`Failed to execute ${input.action}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const DiscordGuildInfoToolContext = [
    DiscordGuildInfoTool.getToolContext()
] as ClaudeTool[];