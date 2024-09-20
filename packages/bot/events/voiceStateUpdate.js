const { postRequest, getRequest } = require('../database/connection')

// In-memory queue to store voice sessions
const voiceSessionQueue = new Map();

// Helper function to log sessions and store in database
function handleVoiceSessionEnd(session) {
    const { joinTimestamp, leaveTimestamp, member, channel, guild } = session;
    const duration = Math.round((leaveTimestamp - joinTimestamp) / 1000); // Duration in seconds

    // Store the session in the database
    // If the duration is more than 60 seconds
    if (duration >= 60) {
        postRequest(`/guilds/${guild.id}/activities`, {
            guildId: guild.id,
            userId: member.id,
            type: "voice-session",
            additional: {
                channelId: channel.id,
                duration: duration,
            }
        });
    }
}

module.exports = async (client, previousState, newState) => {

    const member = newState.member;
    const guild = newState.guild;

    // User joined a voice channel
    if (!previousState.channel && newState.channel) {
        const session = {
            joinTimestamp: Date.now(),
            leaveTimestamp: null,
            member,
            channel: newState.channel,
            guild
        };

        // Store the session in the queue
        voiceSessionQueue.set(member.id, session);
        if (process.env.NODE_ENV === "development") {
            console.log("\x1b[36m", `[Client]: ${member.user.tag} joined ${newState.channel.name}`);
        }

        // User left a voice channel
    } else if (previousState.channel && !newState.channel) {
        const session = voiceSessionQueue.get(member.id);

        if (session) {
            session.leaveTimestamp = Date.now();

            // Process the session after they leave
            handleVoiceSessionEnd(session);

            // Remove session from the queue
            voiceSessionQueue.delete(member.id);
            if (process.env.NODE_ENV === "development") {
                console.log("\x1b[36m", `[Client]: ${member.user.tag} left ${previousState.channel.name}`);
            }
        }
    }

    // User switched voice channels
    else if (previousState.channel && newState.channel && previousState.channel.id !== newState.channel.id) {
        const session = voiceSessionQueue.get(member.id);

        if (session) {
            session.leaveTimestamp = Date.now();

            // Process the session before switching
            handleVoiceSessionEnd(session);

            // Remove old session and create a new one
            voiceSessionQueue.delete(member.id);
            const newSession = {
                joinTimestamp: Date.now(),
                leaveTimestamp: null,
                member,
                channel: newState.channel,
                guild
            };
            voiceSessionQueue.set(member.id, newSession);
            if (process.env.NODE_ENV === "development") {
                console.log("\x1b[36m", `[Client]: ${member.user.tag} switched from ${previousState.channel.name} to ${newState.channel.name}`);
            }
        }
    }





};