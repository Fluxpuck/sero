const LogTypes = {
	'memberEvents': 'Member Events',
	'emojiEvents': 'Emoji Events',
	'roleEvents': 'Role Events',
	'messageEvents': 'Message Events',
	'stickerEvents': 'Sticker Events',
	'inviteEvents': 'Invite Events'
}

/**
 * Returns the name of the event based on the event number.
 * @param {*} eventNumber - The event number to get the name of.
 * @returns - The name of the event.
 */
function getEventName(eventNumber) {
    const events = {
        1: "GuildUpdate",
        10: "ChannelCreate",
        11: "ChannelUpdate",
        12: "ChannelDelete",
        13: "ChannelOverwriteCreate",
        14: "ChannelOverwriteUpdate",
        15: "ChannelOverwriteDelete",
        20: "MemberKick",
        21: "MemberPrune",
        22: "MemberBanAdd",
        23: "MemberBanRemove",
        24: "MemberTimeOut", // Originally MemberUpdate
        25: "MemberRoleUpdate",
        26: "MemberMove",
        27: "MemberDisconnect",
        28: "BotAdd",
        30: "RoleCreate",
        31: "RoleUpdate",
        32: "RoleDelete",
        40: "InviteCreate",
        41: "InviteUpdate",
        42: "InviteDelete",
        50: "WebhookCreate",
        51: "WebhookUpdate",
        52: "WebhookDelete",
        60: "EmojiCreate",
        61: "EmojiUpdate",
        62: "EmojiDelete",
        73: "MessageBulkDelete",
        72: "MessageDelete",
        74: "MessagePin",
        75: "MessageUnpin",
        80: "IntegrationCreate",
        81: "IntegrationUpdate",
        82: "IntegrationDelete",
        83: "StageInstanceCreate",
        84: "StageInstanceUpdate",
        85: "StageInstanceDelete",
        90: "StickerCreate",
        91: "StickerUpdate",
        92: "StickerDelete",
        100: "GuildScheduledEventCreate",
        101: "GuildScheduledEventUpdate",
        102: "GuildScheduledEventDelete",
        140: "AutoModerationRuleCreate",
        141: "AutoModerationRuleUpdate",
        142: "AutoModerationRuleDelete",
        143: "AutoModerationBlockMessage",
        144: "AutoModerationFlagToChannel",
        145: "AutoModerationUserCommunicationDisabled",
        121: "ApplicationCommandPermissionUpdate"
    };

    // If the eventNumber is not in the events object, return "UnknownEvent"
    return events[eventNumber] || "UnknownEvent";
}

/**
 * Returns the name of the event category based on the event number.
 * @param {*} eventNumber - The event number to get the category of.
 * @param {*} eventCategory - The event category to get the name of.
 * @returns - The name of the event category.
 */
function getEventCategory(eventNumber) {
    // Define event categories and their associated numbers
    const eventCategories = {
        memberEvents: [20, 21, 22, 23, 24, 25, 26, 27],
        channelEvents: [10, 11, 12],
        emojiEvents: [60, 61, 62],
        roleEvents: [30, 31, 32],
        messageEvents: [72, 73, 74, 75],
        stickerEvents: [90, 91, 92],
        inviteEvents: [40, 41, 42],
        eventEvents: [100, 101, 102],
        autoModEvents: [140, 141, 142, 143, 144, 145],
        applicationCommandEvents: [121],
    };

    // Find the matching category for the event number
    let eventCategory = Object.keys(eventCategories).find(category =>
        eventCategories[category].includes(eventNumber)
    );

    // If no matching category found, set it as UnknownEvent
    if (!eventCategory) {
        eventCategory = 'UnknownEvent';
    }

    // Return the event category
    return eventCategory;
}


/**
 * Returns true if the event is a moderation action, false if not.
 * @param {*} eventNumber - The event number to check
 * @returns - True or false
 */
function checkModerationAction(eventNumber) {
    const moderationActions = {
        20: "MemberKick",
        22: "MemberBanAdd",
        23: "MemberBanRemove",
        24: "MemberUpdate",
        27: "MemberDisconnect",
    };

    return !!moderationActions[eventNumber];
}

/**
 * Returns the name of the moderation action based on the event number.
 * @param {*} eventNumber - The event number to check
 * @returns - The name of the moderation action
 */
function getAuditActionName(eventNumber) {
    const moderationActionName = {
        20: "Kick",
        22: "Ban",
        23: "Unban",
        24: "Timeout",
        27: "Disconnect",
    };

    return moderationActionName[eventNumber] || "Unknown";
};

/**
 * Returns the log type by key or value
 * @param {*} logType - The key or value to check
 * @returns - The log type
 */
function GetLogTypeByKeyOrValue(logType) {
    // find the key from the value or the value from the key and return it as { key: value }
    const entry = Object.entries(LogTypes).find(([key, value]) => key === logType || value === logType);
    if (entry) {
        return { [entry[0]]: entry[1] };
    }
    return null; // Return null if no match found
}

/**
 * Returns the log type by key
 * @param {*} logType - The key to check
 * @returns - The log type
 */
function GetLogTypeByKey(logType) {
    // return the value of the key
    return LogTypes[logType];
}

module.exports = {
    getEventName,
    getEventCategory,
    checkModerationAction,
    getAuditActionName,
    GetLogTypeByKeyOrValue,
    GetLogTypeByKey
};