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

module.exports = {
    getAuditLogType,
};