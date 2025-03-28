import { Client, Message, TextChannel } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { findUser } from "../utils/user-resolver";

type SendMessageInput = {
    targetId: string;
    content: string;
    isDM?: boolean;
}

export class DiscordSendMessageTool extends ClaudeToolType {
    static getToolContext() {
        return {
            name: "discord_send_message",
            description: "Send a message to a specific Discord channel or user",
            input_schema: {
                type: "object" as const,
                properties: {
                    targetId: {
                        type: "string",
                        description: "The ID or search query for the channel/user to send the message to",
                    },
                    content: {
                        type: "string",
                        description: "The message content to send",
                    },
                    isDM: {
                        type: "boolean",
                        description: "Whether to send as a direct message to a user",
                        default: false,
                    },
                },
                required: ["targetId", "content"],
            },
        };
    }

    constructor(
        private readonly client: Client,
        private readonly message: Message,
    ) {
        super(DiscordSendMessageTool.getToolContext());
    }

    async execute({ targetId, content, isDM = false }: SendMessageInput): Promise<string> {
        try {
            if (isDM) {
                if (!this.message.guild) {
                    throw new Error("Cannot search for users outside of a guild context");
                }

                // Use findUser for flexible user lookup
                const member = await findUser(this.message.guild, targetId, {
                    fuzzyThreshold: 0.3,
                    searchType: 'all'
                });

                if (!member) {
                    throw new Error(`Could not find user matching "${targetId}"`);
                }

                await member.send(content);
                return `Message sent successfully to user ${member.user.tag}`;
            } else {
                const channel = await this.client.channels.fetch(targetId);
                if (!(channel instanceof TextChannel)) {
                    throw new Error("Target channel is not a text channel");
                }
                await channel.send(content);
                return `Message sent successfully to channel #${channel.name}`;
            }
        } catch (error) {
            throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const DiscordSendMessageToolContext = [
    DiscordSendMessageTool.getToolContext()
] as ClaudeTool[];
