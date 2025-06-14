

/**
 * Redis Channels
 * These correspond to Discord events
 */
export enum Channel {
    MEMBER_LEVEL = 'guildMemberLevel',
    MEMBER_ROLE = 'guildMemberRole',
    MEMBER_BIRTHDAY = 'guildMemberBirthday',

    DROP_REWARD = 'guildRewardDrops',

    ERROR = 'error',
}

/**
 * Redis channel types
 * In addition to the Channel
 */
export enum Code {
    LEVEL_UP_NOTIFICATION = 'levelUpNotification',
    LEVEL_CHANGE = 'levelChange',
};

/**
 * Standard redis publisher payload
 */
export type Payload = {
    code?: string;
    message?: string;
    data?: any[];
    timestamp: Date;
};