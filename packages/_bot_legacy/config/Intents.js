/*  Setup and alter Discord client INTENTS */

const BITFIELD =
    (1 << 0) +  // GUILDS
    (1 << 1) +  // GUILD_MEMBERS
    (1 << 2) +  // GUILD_BANS
    // (1 << 3) +  // GUILD_EMOJIS_AND_STICKERS
    (1 << 4) +  // GUILD_INTEGRATIONS
    (1 << 5) +  // GUILD_WEBHOOKS
    // (1 << 6) +  // GUILD_INVITES
    (1 << 7) +  // GUILD_VOICE_STATES
    (1 << 8) +  // GUILD_PRESENCES
    (1 << 9) +  // GUILD_MESSAGES
    // (1 << 10) + // GUILD_MESSAGE_REACTIONS
    // (1 << 11) + // GUILD_MESSAGE_TYPING
    // (1 << 12) + // DIRECT_MESSAGES
    // (1 << 13) + // DIRECT_MESSAGE_REACTIONS
    // (1 << 14) + // DIRECT_MESSAGE_TYPING
    (1 << 15) // MESSAGE_CONTENT
    // (1 << 16) // GUILD_SCHEDULED_EVENTS
    ;

exports.INTENTS_BITFIELD = BITFIELD