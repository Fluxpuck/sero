import { Message, Events, Client } from "discord.js";
import { ClaudeService } from "../services/claude";
import { resolveAttachmentsAndContext } from "../utils/attachment-resolver";

export const name = Events.MessageCreate;
export async function execute(message: Message) {
  const client = message.client as Client;

  // Skip empty messages or messages from bots
  if (!message || !message.content || message.author.bot) return;

  try {
    // Create service instance
    const claudeService = new ClaudeService();

    // Check user permissions to use the bot
    const allowedRoleIds = process.env.ACCESS_ROLE_ID?.split(",") || [];
    const hasAllowedRole = allowedRoleIds.some((roleId) =>
      message.member?.roles.cache.has(roleId)
    );
    const isOwner = client.ownerId === message.author.id;

    // Exit if user lacks permission
    if (!isOwner && !hasAllowedRole) return;

    // Check if this message is for the bot
    const isMention = message.mentions.has(client.user?.id || "");
    const isKeywordTrigger =
      /\b(hello sero|hey sero|sero help|help sero)\b/i.test(message.content);
    const isDM = message.channel.type === 1;

    // Check if message is a reply to bot
    let isReplyToBot = false;
    if (message.reference?.messageId) {
      try {
        const referencedMessage = await message.channel.messages.fetch(
          message.reference.messageId
        );
        isReplyToBot = referencedMessage.author.id === client.user?.id;
      } catch (error) {
        console.error("Error checking if message is a reply to bot:", error);
      }
    }

    // Exit if not addressed to the bot
    if (!(isMention || isKeywordTrigger || isReplyToBot || isDM)) return;

    // Extract prompt, removing mention or trigger words if present
    let prompt = message.content;

    // Remove bot mention from the prompt if present
    if (isMention && client.user) {
      const mentionRegex = new RegExp(`<@!?${client.user.id}>`, "g");
      prompt = prompt.replace(mentionRegex, "").trim();
    }

    // Remove trigger words if present
    if (isKeywordTrigger) {
      prompt = prompt
        .replace(/\b(hello sero|hey sero|sero help|help sero)\b/i, "")
        .trim();
    }

    // Gather attachments and referenced content using utility
    const { attachments, referencedContent } =
      await resolveAttachmentsAndContext(message, client);

    // Prepend referenced message to the prompt for better context
    if (referencedContent) {
      prompt = referencedContent + prompt;
    }

    // Set default prompt if empty after processing
    if (!prompt.trim() || prompt === referencedContent) {
      prompt = "Hello, how can I help you?";
    }

    // Execute Claude service with the prompt
    claudeService.askClaude(prompt, message, attachments);
  } catch (error) {
    console.error("Error in messageCreate:", error);
  }
}
