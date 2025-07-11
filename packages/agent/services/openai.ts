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
  private readonly GENERATE_MODEL = "dall-e-3";
  private readonly EDIT_MODEL = "gpt-image-1";
  private readonly DEFAULT_IMAGE_SIZE = "1024x1024";
  private readonly DEFAULT_IMAGE_QUALITY = "standard";

  constructor(
    private readonly client: Client,
    private readonly message: Message
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public async generateImage(prompt: string, channel: Channel): Promise<void> {
    if (!(channel instanceof TextChannel || channel instanceof ThreadChannel)) {
      return;
    }

    try {
      // Generate image
      const image = await this.openai.images.generate({
        model: this.GENERATE_MODEL,
        prompt,
        size: this.DEFAULT_IMAGE_SIZE,
        quality: this.DEFAULT_IMAGE_QUALITY,
      });

      // Check if image generation was successful
      if (!image || !image.data || !image.data[0].url) {
        return;
      }

      // Fetch the image from the URL
      const response = await fetch(image.data[0].url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch image from OpenAI: ${response.statusText}`
        );
      }

      const image_buffer = Buffer.from(await response.arrayBuffer());
      const image_attachment = new AttachmentBuilder(image_buffer, {
        name: `${this.GENERATE_MODEL}-${image._request_id}.png`,
      });

      // Send image to specified channel
      await channel.send({ files: [image_attachment] });
      //
    } catch (error) {
      console.error(`Error generating image:`, error);
      return;
    }
  }

  public async editImage(prompt: string, channel: Channel): Promise<void> {
    if (!(channel instanceof TextChannel || channel instanceof ThreadChannel)) {
      return;
    }

    // Gather attachments and referenced content using utility
    const { attachments } = await resolveAttachmentsAndContext(
      this.message,
      this.client
    );

    // If no attachments, return with success: true and a user-facing message
    if (!attachments || attachments.length === 0) {
      return;
    }

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
        model: this.EDIT_MODEL,
        n: 1,
        image: file,
        prompt,
        size: this.DEFAULT_IMAGE_SIZE,
        quality: this.DEFAULT_IMAGE_QUALITY,
        background: "opaque",
      });

      // Check if image generation was successful
      if (!image || !image.data) {
        return;
      }

      const image_base64 = image.data[0].b64_json!;
      const image_bytes = Buffer.from(image_base64, "base64");

      const image_attachment = new AttachmentBuilder(image_bytes, {
        name: `${this.EDIT_MODEL}-${image._request_id}.png`,
      });

      // Send image to specified channel
      await channel.send({ files: [image_attachment] });
      //
    } catch (error) {
      console.error(`Error editing image:`, error);
      return;
    }
  }
}
