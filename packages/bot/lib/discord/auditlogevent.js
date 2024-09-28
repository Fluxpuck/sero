const { AuditLogEvent } = require('discord.js'); // Adjust the path as necessary


/**
 * Function to get the key in string format of the AuditLogEvent based on the provided number
 * @param {number} eventNumber - The number corresponding to the AuditLogEvent
 * @returns {string | null} - The key in string format or null if not found
 */
function getAuditLogType(eventNumber) {
    for (const [key, value] of Object.entries(AuditLogEvent)) {
        if (value === eventNumber) {
            return key;
        }
    }
    return null;
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

module.exports = {
    getAuditLogType,
    getEventCategory,
    checkModerationAction,
};