import { Client, Message } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { MessageResolver } from "../utils/message-resolver";

const MAX_FETCH_MESSAGES = 1_000; // MAXIMUM of messages to fetch

type FetchMessagesInput = {
    fromUser?: string;
    inChannel?: string;
    limit?: number;
    mode?: "user" | "channel" | "auto";
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
                    limit: {
                        type: "number",
                        description: `Number of messages to fetch (default is 100, maximum ${MAX_FETCH_MESSAGES})`,
                    },
                    mode: {
                        type: "string",
                        enum: ["user", "channel", "auto"],
                        description: "The mode of fetching messages. 'user' for user messages, 'channel' for channel messages, and 'auto' for automatic detection.",
                    },
                },
                required: [],
            },
        }
    }

    constructor(
        private readonly client: Client,
        private readonly message: Message,
    ) {
        super(DiscordFetchMessagesTool.getToolContext());
    }

    async execute({ fromUser, inChannel, limit = 100, mode = "auto" }: FetchMessagesInput): Promise<string> {
        if (!this.message.guild) {
            return `Error: This command can only be used in a guild.`;
        }

        try {
            // Validate the limit doesn't exceed maximum
            if (limit > MAX_FETCH_MESSAGES) {
                limit = MAX_FETCH_MESSAGES;
            }

            const messages = await MessageResolver.fetchMessages(
                this.message.guild,
                {
                    fromUser,
                    inChannel,
                    limit,
                    mode
                }
            );

            if (!messages || messages.length === 0) {
                return "No messages found matching the given criteria.";
            }

            const response = {
                messageCount: messages.length,
                messages: messages
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
