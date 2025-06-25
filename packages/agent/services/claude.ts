import Anthropic from "@anthropic-ai/sdk";
import { Message, Attachment } from "discord.js";

// Import custom hooks
import useContext from "../hooks/useContext";

// Import Utility functions
import { sanitizeResponse } from "../utils";
import { replyOrSend } from "../utils/replyOrSend";

// Import tool classes for Claude context
import { executeTool, initializeTools } from "./tools";
import { DiscordGuildInfoToolContext } from "../tools/discord_guild_info.tool";
import { DiscordFetchMessagesToolContext } from "../tools/discord_fetch_messages.tool";
import { DiscordModerationToolContext } from "../tools/discord_moderation_actions.tool";
import { DiscordSendMessageToolContext } from "../tools/discord_send_message.tool";

type ClaudeOptions = {
  previousMessages?: any[];
  reasoning?: boolean;
  excludeTools?: boolean;
  finalResponse?: boolean;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class ClaudeService {
  private anthropic: Anthropic;
  private readonly CLAUDE_MODEL = "claude-3-5-haiku-20241022";
  private readonly MAX_TOKENS = 1024;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Prepare system prompt for Claude using useContext hook
   * @param message - Discord message object
   * @returns Formatted system prompt
   */
  private prepareSystemPrompt(message: Message): string {
    const currentDate = new Date().toLocaleString();
    return useContext(
      currentDate,
      message.guild?.name || "DM",
      message.channel && "name" in message.channel
        ? (message.channel as any).name
        : "DM"
    );
  }

  /**
   * Get available tools for Claude
   * @returns Array of tools for Claude API
   */
  private getTools() {
    return [
      ...DiscordGuildInfoToolContext,
      ...DiscordFetchMessagesToolContext,
      ...DiscordModerationToolContext,
      ...DiscordSendMessageToolContext,
    ];
  }

  public async askClaude(
    prompt: string,
    message: Message,
    attachments?: Attachment[],
    options?: ClaudeOptions
  ): Promise<void> {
    const {
      previousMessages = [],
      reasoning = true,
      excludeTools = false,
      finalResponse = true,
    } = options || {};

    let textResponse = "";

    try {
      if ("sendTyping" in message.channel) {
        await message.channel.sendTyping();
      }

      // Initialize tools and system prompt
      initializeTools(message, message.client);
      const systemPrompt = this.prepareSystemPrompt(message);

      // Add the system prompt to the previous messages
      previousMessages.push({ role: "user", content: prompt });

      // If there are attachments, add them as blocks in a single user message
      const attachmentBlocks = [];
      let oversizedAttachments = [];

      // Process images and text attachments - Support for other files may be added later
      for (const attachment of attachments || []) {
        try {
          const isAttachmentOversized = attachment.size > MAX_FILE_SIZE_BYTES;

          if (attachment.contentType?.startsWith("image/")) {
            // Check image size before processing, skip oversized images
            if (isAttachmentOversized) {
              oversizedAttachments.push({
                name: attachment.name || "unnamed image",
                size: attachment.size,
                type: attachment.contentType,
              });
              continue;
            }

            // Process image attachment
            const response = await fetch(attachment.url);
            const arrayBuffer = await response.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString("base64");
            attachmentBlocks.push({
              type: "image",
              source: {
                type: "base64",
                media_type: attachment.contentType,
                data: base64Data,
              },
            });
          } else if (attachment.contentType?.startsWith("text/")) {
            // Check text file size before processing, skip oversized files
            if (isAttachmentOversized) {
              oversizedAttachments.push({
                name: attachment.name || "unnamed file",
                size: attachment.size,
                type: attachment.contentType,
              });
              continue;
            }

            // Process text attachment
            const response = await fetch(attachment.url);
            const textContent = await response.text();
            attachmentBlocks.push({
              type: "text",
              text: `\n\nFile: ${attachment.name}\n${textContent}`,
            });
          }
        } catch (error) {
          console.error(`Error processing ${attachment.name}:`, error);
        }
      }

      // Add a message to the prompt for oversized attachments...
      if (oversizedAttachments.length > 0) {
        const sizeWarning = oversizedAttachments
          .map(
            (attachment) =>
              `${attachment.type} ${attachment.name} (${attachment.size}MB)`
          )
          .join("\n");

        previousMessages.push({
          role: "assistant",
          content: `The following attachments exceed the 5MB size limit and will be skipped:\r\n${sizeWarning}`,
        });
      }

      // Add attachment blocks to the user message
      if (attachmentBlocks.length > 0) {
        previousMessages.push({
          role: "user",
          content: attachmentBlocks,
        });
      }

      // Call the Claude API with the SDK
      const response = await this.anthropic.messages.create({
        model: this.CLAUDE_MODEL,
        max_tokens: this.MAX_TOKENS,
        system: systemPrompt,
        tools: [
          ...(excludeTools ? [] : this.getTools()),
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 2,
            allowed_domains: null,
            blocked_domains: null,
            user_location: {
              type: "approximate",
              city: "San Francisco",
              region: "California",
              country: "US",
              timezone: "America/Los_Angeles",
            },
          },
        ],
        messages: previousMessages,
      });

      // Handle Tool use response
      if (response.stop_reason === "tool_use") {
        // Extract text and tool use information
        let toolTextResponse = "";
        let toolUseBlock: any = null;

        for (const block of response.content) {
          if (block.type === "text") {
            toolTextResponse = block.text;
          } else if (block.type === "tool_use") {
            toolUseBlock = block;
          }
        }

        // Check if tool use block is present
        if (!toolUseBlock) return;

        // Reply with temporary reasoning if Claude provided text
        if (toolTextResponse && reasoning) {
          await replyOrSend(message, sanitizeResponse(toolTextResponse)).catch(
            (err) => console.error("Error sending temp response:", err)
          );
        }

        try {
          // Execute the tool and get the result
          const { id, name, input } = toolUseBlock;
          const toolResult = await executeTool(name, input);

          // Update history with new messages
          const updatedMessages = [
            ...previousMessages,
            {
              role: "assistant",
              content: [
                ...(toolTextResponse
                  ? [{ type: "text", text: toolTextResponse }]
                  : []),
                { type: "tool_use", id, name, input },
              ],
            },
            {
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: id,
                  content: toolResult,
                },
              ],
            },
          ];

          // Update the text response with the tool result
          textResponse = toolTextResponse;

          // Recursive call with tool result and updated history
          return await this.askClaude("", message, attachments, {
            previousMessages: updatedMessages,
            reasoning,
            excludeTools,
            finalResponse,
          });
        } catch (error) {
          console.error("Error executing tool:", error);
          return;
        }
      }

      // Handle End response
      if (response.stop_reason === "end_turn") {
        // Get text from response
        let finalTextResponse = "";

        for (const block of response.content) {
          if (block.type === "text") {
            finalTextResponse += block.text;
          }
        }

        // Update the text response with the final result
        textResponse += finalTextResponse;

        // Reply with the final response if requested
        if (finalResponse && finalTextResponse) {
          await replyOrSend(message, sanitizeResponse(finalTextResponse)).catch(
            (err) => console.error("Error sending response:", err)
          );
        }
      }
    } catch (error) {
      console.error("Error on askClaude:", error);
      return;
    }
  }
}
