import { Message, Client, Attachment } from "discord.js";

export interface AttachmentResolutionResult {
  attachments: Attachment[];
  referencedContent: string;
}

/**
 * Gathers attachments from the given message and its referenced message (if any).
 * Also generates referenced content string for context.
 */
export async function resolveAttachmentsAndContext(
  message: Message,
  client: Client
): Promise<AttachmentResolutionResult> {
  let attachments = Array.from(message.attachments.values()) || [];
  let referencedContent = "";

  if (message.reference?.messageId) {
    try {
      const referencedMessage = await message.channel.messages.fetch(
        message.reference.messageId
      );
      if (referencedMessage) {
        const referencedAuthor = referencedMessage.author.bot
          ? referencedMessage.author.id === client.user?.id
            ? "you"
            : "another bot"
          : `user ${referencedMessage.author.username}`;
        const hasAttachments = referencedMessage.attachments.size > 0;
        referencedContent = `\n\nI'm replying to this message from ${referencedAuthor}:\n"${referencedMessage.content}"\n\n`;
        if (hasAttachments) {
          attachments.push(...referencedMessage.attachments.values());
          referencedContent += `\n\nReferenced Attachments:\n`;
          for (const attachment of referencedMessage.attachments.values()) {
            referencedContent += `\n- ${attachment.name}: ${attachment.url}\n`;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching referenced message (attachment resolver):", error);
    }
  }

  return { attachments, referencedContent };
}
