import { Client, Message, TextChannel, ThreadChannel } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { OpenAIService } from "../services/openai";
import { ChannelResolver } from "../utils/channel-resolver";

type ImageGenerationToolInput = {
  prompt: string;
  channelId: string;
};

export class GenerateImageTool extends ClaudeToolType {
  private openaiService: OpenAIService;

  static getToolContext(): ClaudeTool {
    return {
      name: "generate_image",
      description:
        "Generate, edit, or create variations of images using OpenAI's image generating models. Only use this tool when the user explicitly requests image generation or editing.",
      input_schema: {
        type: "object" as const,
        properties: {
          prompt: {
            type: "string",
            description:
              "A text description of the desired image(s). Maximum length is 1000 characters",
          },
          channelId: {
            type: "string",
            description:
              "The ID or search query for the channel to send the image to",
          },
        },
        required: ["prompt", "channelId"],
      },
    };
  }

  constructor(
    private readonly client: Client,
    private readonly message: Message
  ) {
    super(GenerateImageTool.getToolContext());
    this.openaiService = new OpenAIService(this.client, this.message);
  }

  async execute({
    prompt,
    channelId,
  }: ImageGenerationToolInput): Promise<string> {
    try {
      if (!this.message.guild) {
        return `Error: This command can only be used in a guild.`;
      }

      const channel =
        (await ChannelResolver.resolve(this.message.guild, channelId)) ||
        this.message.channel;
      if (
        !(channel instanceof TextChannel || channel instanceof ThreadChannel)
      ) {
        return `Error: The target channel "${channelId}" is not a text channel.`;
      }

      const result = await this.openaiService.generateImage(prompt, channel);
      if (!result.success) {
        throw new Error(result.message);
      }

      return result.message;
    } catch (error) {
      console.error(`Error in GenerateImageTool:`, error);
      return `Error executing GenerateImageTool: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }
}

export const GenerateImageToolContext = [
  GenerateImageTool.getToolContext(),
] as ClaudeTool[];
