import { Client, Channel, Message, Attachment } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { OpenAIService } from "../services/openai";
import { ChannelResolver } from "../utils/channel-resolver";
import { replyOrSend } from "../utils/replyOrSend";

type ImageGenerationActionType = "generate" | "edit" | "variation";
type ImageGenerationToolInput = {
  action: ImageGenerationActionType;
  prompt: string;
  image?: Attachment;
  channelId?: string;
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
          action: {
            type: "string",
            enum: ["generate", "edit", "variation"],
            description:
              "The action to perform: 'generate' for creating new images from a text prompt, 'edit' for modifying an existing image with a text prompt, or 'variation' for creating variations of an existing image.",
          },
          prompt: {
            type: "string",
            description:
              "A text description of the desired image(s). Maximum length is 1000 characters",
          },
          channelId: {
            type: "string",
            description: "The ID of the channel where the image will be sent",
          },
        },
        required: ["action", "prompt"],
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
    action,
    prompt,
    channelId,
    image,
  }: ImageGenerationToolInput): Promise<string> {
    try {
      if (!this.message.guild) {
        return `Error: This command can only be used in a guild.`;
      }

      const channel = channelId
        ? ChannelResolver.resolve(this.message.guild, channelId)
        : this.message.channel;

      switch (action) {
        case "generate":
          const result = await this.openaiService.generateImage(
            prompt,
            channel as Channel
          );

          // Return the success message
          if (result.success) {
            return result.message;
          }

        // case "edit":
        //   if (!image) {
        //     return `Error: An image attachment is required for the 'edit' action.`;
        //   }

        //   const editResult = await this.openaiService.editImage(image, prompt);
        //   if (editResult.success) {
        //     return editResult.message;
        //   }

        //   return editResult.message;
        // case "variation":
        //   if (!image) {
        //     return `Error: An image attachment is required for the 'variation' action.`;
        //   }

        //   const variationResult = await this.openaiService.editImage(
        //     image,
        //     prompt,
        //     true
        //   );
        //   if (variationResult.success) {
        //     return variationResult.message;
        //   }

        //   return variationResult.message;
        default:
          return `Error: Unknown action '${action}'. -- Valid action is 'generate'. ('edit' and 'variation' are currently disabled).`;
      }
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
