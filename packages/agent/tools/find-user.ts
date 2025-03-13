import { Message, GuildMember } from 'discord.js';

interface FindUserParams {
    query: string;
}

interface UserResult {
    id: string;
    username: string;
    displayName: string;
    roles: string[];
    joinedAt: Date | null;
    avatarUrl: string;
}

export async function findUser(message: Message, params: FindUserParams): Promise<string> {
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    try {
        const { query } = params;

        if (!query || query.length < 2) {
            return 'Please provide at least 2 characters to search for a user.';
        }

        let member: GuildMember | null = null;

        // First try to find by ID if the query looks like a snowflake
        if (/^\d{17,19}$/.test(query)) {
            try {
                member = await message.guild.members.fetch(query);
            } catch (error) {
                // If not found by ID, will continue to username search
                console.log(`User not found by ID: ${query}`);
            }
        }

        // If not found by ID, search by username/displayname
        if (!member) {
            const members = await message.guild.members.fetch();
            const lowerQuery = query.toLowerCase();

            member = members.find(m =>
                m.user.username.toLowerCase().includes(lowerQuery) ||
                m.displayName.toLowerCase().includes(lowerQuery)
            ) || null;
        }

        if (!member) {
            return `No user found matching "${query}"`;
        }

        // Format the user information with markdown
        const userInfo: UserResult = {
            id: member.id,
            username: member.user.username,
            displayName: member.displayName,
            roles: member.roles.cache
                .filter(role => role.name !== '@everyone')
                .map(role => role.name),
            joinedAt: member.joinedAt,
            avatarUrl: member.user.displayAvatarURL({ size: 128 })
        };

        // Format response with markdown
        return `### User Found: ${userInfo.displayName}
**Username**: ${userInfo.username}
**ID**: \`${userInfo.id}\`
**Roles**: ${userInfo.roles.length ? userInfo.roles.join(', ') : 'No special roles'}
**Joined Server**: ${userInfo.joinedAt?.toLocaleDateString() ?? 'Unknown'}
**Avatar**: ${userInfo.avatarUrl}`;

    } catch (error) {
        console.error('Error finding user:', error);
        return `Error finding user: ${error instanceof Error ? error.message : String(error)}`;
    }
}