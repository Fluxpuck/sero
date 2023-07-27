/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

// → Importing necessary modules, functions and classes
const { getEventCategory } = require("../lib/discord/auditlogevent");

module.exports = async (client, auditLog, guild) => {

    // Get the event type number
    const { action } = auditLog;

    // → Switch statement to handle each event separately
    switch (getEventCategory(action)) {
        case "memberEvents":
            const memberEvents = require("../lib/discord/events/memberevents");
            memberEvents.memberEvents(client, auditLog, guild);
            break;
        case "channelEvents":
            const channelEvents = require("../lib/discord/events/channelevents");
            channelEvents.channelEvents(client, auditLog, guild);
            break;
        case "emojiEvents":
            const emojiEvents = require("../lib/discord/events/emojievents");
            emojiEvents.emojiEvents(client, auditLog, guild);
            break;
        case "roleEvents":
            const roleEvents = require("../lib/discord/events/roleevents");
            roleEvents.roleEvents(client, auditLog, guild);
            break;
        case "messageEvents":
            const messageEvents = require("../lib/discord/events/messageevents");
            messageEvents.messageEvents(client, auditLog, guild);
            break;
        case "stickerEvents":
            const stickerEvents = require("../lib/discord/events/stickerevents");
            stickerEvents.stickerEvents(client, auditLog, guild);
            break;
        case "inviteEvents":
            const inviteEvents = require("../lib/discord/events/inviteevents");
            inviteEvents.inviteEvents(client, auditLog, guild);
            break;
        case "eventEvents":
            const eventEvents = require("../lib/discord/events/eventevents");
            eventEvents.eventEvents(client, auditLog, guild);
            break;
        case "autoModEvents":
            const autoModEvents = require("../lib/discord/events/automodevents");
            autoModEvents.autoModEvents(client, auditLog, guild);
            break;
        case "applicationCommandEvents":
            const applicationCommandEvents = require("../lib/discord/events/applicationcommandevents");
            applicationCommandEvents.applicationCommandEvents(client, auditLog, guild);
            break;
        case "UnknownEvent":
            break;
        default:
            break;
    }
    return;
}