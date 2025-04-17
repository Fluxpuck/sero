export type MessageFormat = {
    id: string;
    content: string;
    author: {
        id: string;
        username: string;
        displayName: string;
    };
    attachments: Array<{ name: string; url: string; contentType?: string }>;
    embeds: Array<any>;
    timestamp: Date;
    channelId: string;
    hasStickers: boolean;
    reference?: {
        messageId?: string;
        channelId?: string;
        guildId?: string;
    }
}

export type MessageViolationCheckInput = {
    userId: string;
    messages: string;
}