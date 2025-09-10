import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { logger } from "./logger";

const log = logger("permissions");

type ModAction = "warn" | "kick" | "ban" | "disconnect" | "timeout" | "purge";

type PermissionCheck = {
  success: boolean;
  message: string;
  isBot: boolean;
  isOwner: boolean;
  isSelf: boolean;
  isModeratable: boolean;
};

/**
 * Checks if a user has permission to perform a moderation action on another member
 * @param interaction The command interaction
 * @param member The target member
 * @param action The moderation action being performed
 * @returns Permission check result
 */
export const checkPermissions = (
  interaction: ChatInputCommandInteraction,
  member: GuildMember,
  action: ModAction
): PermissionCheck => {
  try {
    const isBot = member.user.bot;
    const isOwner = member.user.id === interaction.guild?.ownerId;
    const isSelf = member.user.id === interaction.user.id;
    const isModeratable = member.moderatable;

    // Determine if the action can be performed
    const success = !isBot && !isOwner && !isSelf && !isModeratable;

    // Generate appropriate error message
    let message = "";
    if (isBot) {
      message = `You cannot ${action} a bot`;
    } else if (isOwner) {
      message = `You cannot ${action} the server owner`;
    } else if (isSelf) {
      message = `You cannot ${action} yourself`;
    } else if (!isModeratable) {
      message = `You cannot ${action} a moderator`;
    }

    return {
      success,
      message,
      isBot,
      isOwner,
      isSelf,
      isModeratable,
    };
  } catch (error) {
    log.error(`Error checking permissions for ${action}:`, error);
    return {
      success: false,
      message: "An error occurred while checking permissions",
      isBot: false,
      isOwner: false,
      isSelf: false,
      isModeratable: false,
    };
  }
};
