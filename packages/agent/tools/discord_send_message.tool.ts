import { Client, Message, TextChannel, ThreadChannel } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { UserResolver } from "../utils/user-resolver";
import { ChannelResolver } from "../utils/channel-resolver";
import axios from "axios";

type SendMessageInput = {
  type: "message" | "dm" | "gif";
  targetId: string;
  content: string;
};

export class DiscordSendMessageTool extends ClaudeToolType {
  static getToolContext() {
    return {
      name: "discord_send_message",
      description:
        "Send a message, DM, or GIF to a specific Discord channel or user",
      input_schema: {
        type: "object" as const,
        properties: {
          type: {
            type: "string",
            description:
              "The type of message to send: 'message', 'dm', or 'gif'",
            enum: ["message", "dm", "gif"],
          },
          targetId: {
            type: "string",
            description:
              "The ID or search query for the channel/user to send the message to",
          },
          content: {
            type: "string",
            description: "The message content or GIF search query to send",
          },
        },
        required: ["type", "targetId", "content"],
      },
    };
  }
  constructor(
    private readonly client: Client,
    private readonly message: Message
  ) {
    super(DiscordSendMessageTool.getToolContext());
  }

  async execute({
    type,
    targetId,
    content,
  }: SendMessageInput): Promise<string> {
    if (!this.message.guild) {
      return `Error: This command can only be used in a guild.`;
    }
    try {
      let messageContent = content;

      // Use a switch case to handle different message types
      switch (type) {
        case "gif": {
          const tenorKey = process.env.TENOR_KEY;
          if (!tenorKey) {
            throw new Error("TENOR_KEY environment variable is not set");
          }

          // Use axios directly for Tenor API requests
          const tenorApiService = axios.create({
            baseURL: "https://tenor.googleapis.com/v2/",
          });

          // Use apiService instead of fetch
          const response = await (content.toLowerCase() === "random"
            ? tenorApiService.get(
                `trending?key=${tenorKey}&limit=40&contentfilter=high`
              )
            : tenorApiService.get(
                `search?q=${encodeURIComponent(
                  content
                )}&key=${tenorKey}&limit=20&contentfilter=high`
              ));

          const data = response.data;
          if (!data.results?.length) {
            return `Error: No GIFs found for the given query`;
          }

          const randomGif =
            data.results[Math.floor(Math.random() * data.results.length)];
          messageContent = randomGif.media_formats.gif.url;

          // After getting GIF URL, send it as a regular message
          const channel =
            (await ChannelResolver.resolve(this.message.guild, targetId)) ||
            this.message.channel;
          if (
            !(
              channel instanceof TextChannel || channel instanceof ThreadChannel
            )
          ) {
            return `Error: The target channel "${targetId}" is not a text channel.`;
          }
          await channel.send(messageContent);
          return `GIF sent successfully to channel ${channel.name}`;
        }

        case "dm": {
          const member = await UserResolver.resolve(
            this.message.guild,
            targetId
          );
          if (!member) {
            return `Error: Could not find user "${targetId}."`;
          }

          try {
            await member.send(messageContent);
            return `Message sent successfully to user ${member.user.tag}`;
          } catch (error) {
            return `Failed to send DM to user "${member.user.tag}". Their DMs are most likely disabled.`;
          }
        }

        case "message": {
          const channel =
            (await ChannelResolver.resolve(this.message.guild, targetId)) ||
            this.message.channel;
          if (
            !(
              channel instanceof TextChannel || channel instanceof ThreadChannel
            )
          ) {
            return `Error: The target channel "${targetId}" is not a text channel.`;
          }
          await channel.send(messageContent);
          return `Message sent successfully to channel ${channel.name}`;
        }

        default:
          return `Error: Invalid message type "${type}"`;
      }
    } catch (error) {
      console.error(`Error on DiscordSendMessageTool:`, error);
      return `Could not send message: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }
}

export const DiscordSendMessageToolContext = [
  DiscordSendMessageTool.getToolContext(),
] as ClaudeTool[];
