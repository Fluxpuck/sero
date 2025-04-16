import { Message, Client } from 'discord.js';
import { ClaudeService } from '../services/claude';

export const name = 'AutoModeration' as const;
export async function execute(message: Message) {

    // Check if auto moderation is enabled
    if (process.env.AUTO_MODERATION_ENABLED !== 'true') return;

    // Check if the message has a guild, is from a bot, or if the member is not moderatable
    if (!message.guild || message.author.bot) return;  // !message.member?.moderatable

    // Only moderate on these channels
    const moderateChannelIds = process.env.AUTO_MODERATION_CHANNELS?.split(',') || [];
    const isAutoModerationChannel = moderateChannelIds.some(channelId => message.channel.id === channelId);
    if (!isAutoModerationChannel) return;

    // Create an instance
    const claudeService = new ClaudeService();

    try {

        // Send the message through the Claude service for moderation
        // This will check for any violations in the message content
        await claudeService.checkViolation(message);

    } catch (error) {
        console.error('Error in autoModeration:', error);
    }
}
