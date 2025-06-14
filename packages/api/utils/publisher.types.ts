
/**
 * Redis channels
 * These correspond to Discord events
 */
export enum Channel {
    HEARTBEAT = 'heartbeat',
    LEVEL = 'guildMemberLevel',
    ROLE = 'guildMemberRole',
    DROP = 'guildRewardDrops',
    BIRTHDAY = 'guildMemberBirthday',
};

/**
 * Standard redis publisher payload
 */
export type Payload = {
    code: string;
    data: any[];
    timestamp: Date;
};