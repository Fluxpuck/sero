import { Client, Message, TextChannel, DMChannel, ThreadChannel } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { MessageResolver } from "../utils/message-resolver";

const MAX_FETCH_MESSAGES = 100; // MAXIMUM of messages to fetch
const MAX_RETURN_MESSAGES = 25; // MAXIMUM of messages to return through Claude

type FetchMessagesInput = {
    fromUser?: string;
    inChannel?: string;
    type?: "gif" | "url" | "media" | "sticker";
    time?: {
        before?: string;
        after?: string;
    };
    limit?: number;
}

export class DiscordFetchMessagesTool extends ClaudeToolType {
    static getToolContext() {
        return {
            name: "discord_fetch_messages",
            description: "Fetch messages from a specific Discord channel or user. The tool can filter messages by type (gif, url, media, sticker) and time range. Only use this tool if explicitly requested by the user.",
            input_schema: {
                type: "object" as const,
                properties: {
                    fromUser: {
                        type: "string",
                        description: "The ID or search query for the user to fetch messages from",
                    },
                    inChannel: {
                        type: "string",
                        description: "The ID or search query for the channel to fetch messages from",
                    },
                    type: {
                        type: "array",
                        description: "The types of messages to fetch (gif, url, media, sticker)",
                        enum: ["gif", "url", "media", "sticker"],
                    },
                    time: {
                        type: "object",
                        properties: {
                            before: {
                                type: "string",
                                description: "Fetch messages before this time"
                            },
                            after: {
                                type: "string",
                                description: "Fetch messages after this time"
                            },
                        },
                        description: "Time range for the data to retrieve, can be either (optional)"
                    },
                    limit: {
                        type: "number",
                        description: `Number of messages to fetch (default is ${MAX_FETCH_MESSAGES})`,
                    },
                },
                required: ["fromUser", "inChannel"],
            },
        };
    }

    constructor(
        private readonly client: Client,
        private readonly message: Message,
    ) {
        super(DiscordFetchMessagesTool.getToolContext());
    }

    async execute({ fromUser, inChannel, type, time, limit = 10 }: FetchMessagesInput): Promise<string> {
        if (!this.message.guild) {
            return `Error: This command can only be used in a guild.`;
        }

        try {
            // Apply the limit constraints
            const fetchLimit = Math.min(limit || MAX_FETCH_MESSAGES, MAX_FETCH_MESSAGES);

            // Fetch the messages using MessageResolver
            const messages = await MessageResolver.fetchMessages(
                this.message.guild,
                {
                    fromUser,
                    inChannel,
                    type,
                    time,
                    limit: fetchLimit
                }
            );

            if (messages.size === 0) {
                return "No messages found matching the given criteria.";
            }

            const formattedMessages = Array.from(messages.values())
                .map(msg => MessageResolver.formatMessage(msg))
                .slice(0, MAX_RETURN_MESSAGES);

            const response = {
                messageCount: messages.size,
                returnedCount: formattedMessages.length,
                messages: formattedMessages
            };

            return JSON.stringify(response, null, 2);
        } catch (error) {
            throw new Error(`Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const DiscordFetchMessagesToolContext = [
    DiscordFetchMessagesTool.getToolContext()
] as ClaudeTool[];
