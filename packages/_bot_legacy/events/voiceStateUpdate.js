const { logEmbed } = require("../assets/embed");
const { postRequest, getRequest } = require("../database/connection");
const {
  unixTimestamp,
  formatTime,
} = require("../lib/helpers/TimeDateHelpers/timeHelper");

// In-memory queue to store voice sessions
const voiceSessionQueue = new Map();

// Interval check for awarding XP (every 5 minutes)
const VOICE_XP_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
let voiceXpInterval;

// Function to check voice sessions and award XP to eligible users
function checkVoiceSessionsForXp(client) {
  const now = Date.now();

  voiceSessionQueue.forEach((session, userId) => {
    const {
      member,
      guild,
      validForXP,
      joinTimestamp,
      lastXpAward = 0,
    } = session;

    // Check if user is eligible for XP and if enough time has passed since last award
    if (validForXP && now - lastXpAward >= VOICE_XP_INTERVAL) {
      postRequest(`/guilds/${guild.id}/levels/exp/gain/${member.id}`);

      // Update the last XP award timestamp
      session.lastXpAward = now;

      if (process.env.NODE_ENV === "development") {
        console.log(
          "\x1b[36m",
          `[Client]: ${member.user.tag} gained XP from ongoing voice activity`
        );
      }
    }
  });
}

// Helper function to log sessions and store in database
async function handleVoiceSessionEnd(session, client) {
  const { joinTimestamp, leaveTimestamp, member, channel, guild, validForXP } =
    session;
  const duration = Math.round(leaveTimestamp - joinTimestamp);
  const durationFormatted = formatTime(duration, true);

  // Store the session in the database
  // If the duration is more than 60 seconds
  if (duration >= 60) {
    await postRequest(`/guilds/${guild.id}/activities`, {
      guildId: guild.id,
      userId: member.id,
      type: "voice-session",
      additional: {
        channelId: channel.id,
        duration: duration / 1000, // Convert to seconds
      },
    });

    // Final XP award only if eligible and session lasted at least 1 minute
    // But we're not doing bulk rewards here since we're doing periodic rewards
    if (validForXP && duration >= 60000 && duration < VOICE_XP_INTERVAL) {
      // Award one final XP for sessions shorter than the interval
      await postRequest(`/guilds/${guild.id}/levels/exp/gain/${member.id}`);

      if (process.env.NODE_ENV === "development") {
        console.log(
          "\x1b[36m",
          `[Client]: ${member.user.tag} gained final XP from voice session`
        );
      }
    }
  }

  // Fetch the vc log channel from the database
  const vcLogChannelResponse = await getRequest(
    `/guilds/${guild.id}/settings/vc-logs`
  );
  if (vcLogChannelResponse.status !== 200) return;

  // Get channel from request and send message
  const { targetId, exclude } = vcLogChannelResponse.data;
  const logChannel = await guild.channels.fetch(targetId);
  if (logChannel && !exclude?.includes(channel.id)) {
    const content = `<t:${unixTimestamp()}> - **${member.user.tag}** was in <#${
      channel.id
    }> for \`${durationFormatted}\``;
    const footer = `-# <@${member.id}> | ${member.id}`;

    const embedMessage = logEmbed({
      description: content,
      footer: footer,
    });

    logChannel.send({
      embeds: [embedMessage],
    });
  }
}

// Helper function to check if a voice session is valid for XP gain
function isValidForXpGain(state) {
  if (!state.channel) return false;

  // Check if user is unmuted
  const isUnmuted = !state.selfMute && !state.serverMute;

  // Check if user is not alone in the channel
  const hasCompany = state.channel.members.size > 1;

  return isUnmuted && hasCompany;
}

module.exports = async (client, previousState, newState) => {
  if (!newState.guild) return;

  // Start the interval check if it's not already running
  if (!voiceXpInterval) {
    voiceXpInterval = setInterval(
      () => checkVoiceSessionsForXp(client, isGuildPremium),
      VOICE_XP_INTERVAL
    );

    // Make sure to clean up on process exit
    process.on("exit", () => {
      if (voiceXpInterval) clearInterval(voiceXpInterval);
    });
  }

  const member = newState.member;
  const guild = newState.guild;

  // User joined a voice channel
  if (!previousState.channel && newState.channel) {
    const validForXP = isValidForXpGain(newState);

    const session = {
      joinTimestamp: Date.now(),
      leaveTimestamp: null,
      lastXpAward: 0,
      member,
      channel: newState.channel,
      guild,
      validForXP,
    };

    // Store the session in the queue
    voiceSessionQueue.set(member.id, session);
    if (process.env.NODE_ENV === "development") {
      console.log(
        "\x1b[36m",
        `[Client]: ${member.user.tag} joined ${newState.channel.name} (XP eligible: ${validForXP})`
      );
    }

    // User left a voice channel
  } else if (previousState.channel && !newState.channel) {
    const session = voiceSessionQueue.get(member.id);

    if (session) {
      session.leaveTimestamp = Date.now();

      // Process the session after they leave
      await handleVoiceSessionEnd(session, client);

      // Remove session from the queue
      voiceSessionQueue.delete(member.id);
      if (process.env.NODE_ENV === "development") {
        console.log(
          "\x1b[36m",
          `[Client]: ${member.user.tag} left ${previousState.channel.name}`
        );
      }
    }
  }

  // User switched voice channels or state changed (mute/unmute, etc.)
  else if (previousState.channel) {
    const session = voiceSessionQueue.get(member.id);

    // If switching channels
    if (
      newState.channel &&
      previousState.channel &&
      previousState.channel.id !== newState.channel.id
    ) {
      if (session) {
        session.leaveTimestamp = Date.now();

        // Process the session before switching
        await handleVoiceSessionEnd(session, client);

        // Remove old session and create a new one
        voiceSessionQueue.delete(member.id);

        const validForXP = isValidForXpGain(newState);

        const newSession = {
          joinTimestamp: Date.now(),
          leaveTimestamp: null,
          lastXpAward: 0,
          member,
          channel: newState.channel,
          guild,
          validForXP,
        };
        voiceSessionQueue.set(member.id, newSession);
        if (process.env.NODE_ENV === "development") {
          console.log(
            "\x1b[36m",
            `[Client]: ${member.user.tag} switched from ${previousState.channel.name} to ${newState.channel.name} (XP eligible: ${validForXP})`
          );
        }
      }
    }

    // If state changed (mute/unmute or people joining/leaving the channel)
    else if (session) {
      // Update the validForXP status when user mutes/unmutes or people join/leave
      const currentValidForXP = isValidForXpGain(newState);

      // If XP eligibility changed, update it
      if (session.validForXP !== currentValidForXP) {
        session.validForXP = currentValidForXP;
        if (process.env.NODE_ENV === "development") {
          console.log(
            "\x1b[36m",
            `[Client]: ${member.user.tag}'s XP eligibility changed to: ${currentValidForXP}`
          );
        }
      }
    }
  }
};
