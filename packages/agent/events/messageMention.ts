import { Message, Client } from 'discord.js';
import { UserResolver } from '../utils/user-resolver';

export const name = 'MessageMention' as const;
export async function execute(message: Message) {
    if (!message.guild) return;
    if (message.author.bot) return;

    const client = message.client as Client;
    const isOwner = message.author.id === client.ownerId;

    try {
        // Check if the message is a mention of the bot or contains the keyword "flux"
        if (/\b[fF][lL][uU][xX]\w*\b/.test(message.content) && !isOwner) {
            // Send a message to the owner if they are mentioned in the message
            const owner = await UserResolver.resolve(message.guild, `${client.ownerId}`);
            if (!isOwner && owner) {
                await owner.send(`⚠️ You've been [mentioned](${message.url}) by ${message.author.tag}`);
            }
        }
    } catch (error) {
        console.error('Error in messageMention:', error);
    }
}
