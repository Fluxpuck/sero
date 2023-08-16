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
        24: "MemberUpdate",
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
function getEventCategory(eventNumber, eventCategory = undefined) {
    // Cluster event numbers into different groups
    const memberEvents = [20, 21, 22, 23, 24, 25, 26, 27];
    const channelEvents = [10, 11, 12];
    const emojiEvents = [60, 61, 62];
    const roleEvents = [30, 31, 32];
    const messageEvents = [72, 73, 74, 75];
    const stickerEvents = [90, 91, 92];
    const inviteEvents = [40, 41, 42];
    const eventEvents = [100, 101, 102];
    const autoModEvents = [140, 141, 142, 143, 144, 145];
    const applicationCommandEvents = [121];

    // Switch statement to handle each group of events separately
    switch (true) {
        case memberEvents.includes(eventNumber):
            eventCategory = 'memberEvents';
            break;
        case channelEvents.includes(eventNumber):
            eventCategory = 'channelEvents';
            break;
        case emojiEvents.includes(eventNumber):
            eventCategory = 'emojiEvents';
            break;
        case roleEvents.includes(eventNumber):
            eventCategory = 'roleEvents';
            break;
        case messageEvents.includes(eventNumber):
            eventCategory = 'messageEvents';
            break;
        case stickerEvents.includes(eventNumber):
            eventCategory = 'stickerEvents';
            break;
        case inviteEvents.includes(eventNumber):
            eventCategory = 'inviteEvents';
            break;
        case eventEvents.includes(eventNumber):
            eventCategory = 'eventEvents';
            break;
        case autoModEvents.includes(eventNumber):
            eventCategory = 'autoModEvents';
            break;
        case applicationCommandEvents.includes(eventNumber):
            eventCategory = 'applicationCommandEvents';
            break;
        default:
            eventCategory = 'UnknownEvent';
            break;
    }

    // Return the event name
    return eventCategory;
}

module.exports = { getEventName, getEventCategory };