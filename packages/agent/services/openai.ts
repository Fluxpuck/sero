import OpenAI, { Uploadable } from "openai";
import {
  Client,
  Message,
  AttachmentBuilder,
  Channel,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import { resolveAttachmentsAndContext } from "../utils/attachment-resolver";

export type ImageGenerationOptions = {
  transparent_background: boolean;
};

export type ImageGenerationResponse = {
  success: boolean;
  message: string;
};

/**
 * Service class for OpenAI API interactions
 * Handles image generation, editing, and variations using DALL-E models
 */
export class OpenAIService {
  private openai: OpenAI;
  private readonly OPENAI_MODEL = "gpt-image-1";
  private readonly IMAGE_SIZE = "1024x1024";
  private readonly IMAGE_QUALITY = "low";

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
    channel: Channel,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResponse> {
    if (!(channel instanceof TextChannel || channel instanceof ThreadChannel)) {
      return {
        success: false,
        message: `Error: The target channel "${channel.id}" is not a text channel.`,
      };
    }

    const { transparent_background = false } = options || {};

    try {
      // Generate image
      const image = await this.openai.images.generate({
        model: this.OPENAI_MODEL,
        prompt,
        size: this.IMAGE_SIZE,
        quality: this.IMAGE_QUALITY,
        background: transparent_background ? "transparent" : "opaque",
      });

      // Check if image generation was successful
      if (!image || !image.data) {
        return { success: false, message: "Error: Failed to generate image." };
      }

      const image_base64 = image.data[0].b64_json!;
      const image_bytes = Buffer.from(image_base64, "base64");

      const image_attachment = new AttachmentBuilder(image_bytes, {
        name: `${this.OPENAI_MODEL}-${this.message.id}-generate.png`,
      });

      // Send image to specified channel
      await channel.send({ files: [image_attachment] });
      //
    } catch (error) {
      console.error(`Error generating image:`, error);
      return { success: false, message: `Error: Failed to generate image.` };
    }

    return { success: true, message: `Image generated successfully.` };
  }

  public async editImage(
    prompt: string,
    channel: Channel,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResponse> {
    if (!(channel instanceof TextChannel || channel instanceof ThreadChannel)) {
      return {
        success: false,
        message: `Error: The target channel "${channel.id}" is not a text channel.`,
      };
    }

    // Gather attachments and referenced content using utility
    const { attachments } = await resolveAttachmentsAndContext(
      this.message,
      this.client
    );

    try {
      // Download the attachment into a buffer
      const response = await fetch(attachments[0].url);
      const arrayBuffer = await response.arrayBuffer();

      // Convert array buffer to file
      const file = new File([arrayBuffer], `${attachments[0].name}.png`, {
        type: "image/png",
      }) as Uploadable;

      // Edit image
      const image = await this.openai.images.edit({
        model: this.OPENAI_MODEL,
        n: 1,
        image: file,
        prompt,
      });

      // Check if image generation was successful
      if (!image || !image.data) {
        return { success: false, message: "Error: Failed to generate image." };
      }

      const image_base64 = image.data[0].b64_json!;
      const image_bytes = Buffer.from(image_base64, "base64");

      const image_attachment = new AttachmentBuilder(image_bytes, {
        name: `${this.OPENAI_MODEL}-${this.message.id}-edit.png`,
      });

      // Send image to specified channel
      await channel.send({ files: [image_attachment] });
      //
    } catch (error) {
      console.error(`Error editing image:`, error);
      return { success: false, message: `Error: Failed to edit image.` };
    }

    return { success: true, message: `Image edited successfully.` };
  }
}
