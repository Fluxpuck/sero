import OpenAI from "openai";
import {
  Client,
  Message,
  Attachment,
  AttachmentBuilder,
  Channel,
  TextChannel,
  ThreadChannel,
} from "discord.js";

const IMAGE_SIZE = "1024x1024";

type ImageGenerationResponse = {
  success: boolean;
  message: string;
};

/**
 * Service class for OpenAI API interactions
 * Handles image generation, editing, and variations using DALL-E models
 */
export class OpenAIService {
  private openai: OpenAI;
  private OPENAI_MODEL = "gpt-image-1";

  constructor(
    private readonly client: Client,
    private readonly message: Message
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public async generateImage(
    prompt: string,
    channel: Channel
  ): Promise<ImageGenerationResponse> {
    if (!(channel instanceof TextChannel || channel instanceof ThreadChannel)) {
      return {
        success: false,
        message: `Error: The target channel "${channel.id}" is not a text channel.`,
      };
    }

    try {
      const image = await this.openai.images.generate({
        model: this.OPENAI_MODEL,
        prompt,
        size: IMAGE_SIZE,
      });

      // Check if image generation was successful
      if (!image || !image.data) {
        return { success: false, message: "Error: Failed to generate image." };
      }

      const image_base64 = image.data[0].b64_json!;
      const image_bytes = Buffer.from(image_base64, "base64");

      const image_attachment = new AttachmentBuilder(image_bytes, {
        name: `generated-image-${this.message.id}.png`,
      });

      await channel.send({ files: [image_attachment] });
      return { success: true, message: `Image generated successfully.` };
    } catch (error) {
      console.error(`Error generating image:`, error);
      return { success: false, message: `Error: Failed to generate image.` };
    }
  }

  public async editImage(
    image: Attachment,
    prompt: string,
    variation = false
  ): Promise<ImageGenerationResponse> {
    return {
      success: false,
      message: "Error: Image editing is currently disabled.",
    };
  }
}
