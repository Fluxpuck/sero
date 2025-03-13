// src/tools/user-info.ts
import { Message } from 'discord.js';

interface UserInfoParams {
    userId?: string;
    username?: string;
}

export async function getUserInfo(message: Message, params: UserInfoParams): Promise<string> {
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    try {
        let member;

        if (params.userId) {
            // Validate if the input looks like a Discord snowflake (ID)
            if (!/^\d+$/.test(params.userId)) {
                return 'Invalid user ID format. User IDs should only contain numbers.';
            }
            member = await message.guild.members.fetch(params.userId);
        } else if (params.username) {
            // Search by username
            const members = await message.guild.members.fetch();
            member = members.find(m =>
                m.user.username.toLowerCase() === params.username?.toLowerCase() ||
                m.displayName.toLowerCase() === params.username?.toLowerCase()
            );
        } else {
            return 'Please provide either a userId or username parameter.';
        }

        if (!member) {
            return `User ${params.userId || params.username} not found in this server`;
        }

        return JSON.stringify({
            id: member.id,
            username: member.user.username,
            displayName: member.displayName,
            joinedAt: member.joinedAt,
            roles: Array.from(member.roles.cache.values())
                .map(role => role.name)
                .filter(name => name !== '@everyone'),
            isBot: member.user.bot
        }, null, 2);
    } catch (error) {
        console.error('Error getting user info:', error);
        return `Error getting user info: ${error}`;
    }
}