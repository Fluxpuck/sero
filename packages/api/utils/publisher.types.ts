
/**
 * Redis Channels
 * These correspond to Discord events
 */
export enum Channel {
    GUILD_MEMBER_LEVEL = 'guildMemberLevel',
    GUILD_MEMBER_ROLE = 'guildMemberRole',
    GUILD_MEMBER_BIRTHDAY = 'guildMemberBirthday',

    GUILD_DROP_REWARD = 'guildRewardDrops',

    ERROR = 'error',
}

/**
 * Standard redis publisher payload
 */
export type Payload = {
    code: number;
    message?: string;
    data?: any[];
    timestamp: Date;
};