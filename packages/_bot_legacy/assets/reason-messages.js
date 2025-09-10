const KICK_PREREASONS = {
    IMPERSONATION: "Impersonating a staff member or another user.",
    INAPPROPRIATE_USERNAME: "Having an innapropriate username.",
    ALT_ACCOUNT: "Using an alt account.",
    MULTIPLE_VIOLATIONS: "Multiple server rule infringements.",
    RACIAL_SLURS: "Saying racial slurs in chat.",
    DISCORD_TOS_VIOLATION: "Violating Discord Terms of Service.",
    NSFW_VIOLATION: "Posting NSFW content.",
    UNDERAGE_USER: "Being under the age of 12, violating Discord ToS."
}

const BAN_PREREASONS = {
    IMPERSONATION: "Impersonating a staff member or another user.",
    INAPPROPRIATE_USERNAME: "Having an innapropriate username.",
    ALT_ACCOUNT: "Using an alt account.",
    MULTIPLE_VIOLATIONS: "Multiple server rule infringements.",
    RACIAL_SLURS: "Saying racial slurs in chat.",
    DISCORD_TOS_VIOLATION: "Violating Discord Terms of Service.",
    NSFW_VIOLATION: "Posting NSFW content.",
    UNDERAGE_USER: "Being under the age of 12, violating Discord ToS."
}

const WARN_PREREASONS = {
    IMPERSONATION: "Impersonation of a staff member or another user.",
    INAPPROPRIATE_USERNAME: "You have an innapropriate username.",
    ALT_ACCOUNT: "You account has been flagged as an alt account.",
    MULTIPLE_VIOLATIONS: "This is a warning for multiple server rule infringements.",
    RACIAL_SLURS: "Using racial slurs in chat.",
    DISCORD_TOS_VIOLATION: "Violating Discord Terms of Service",
    NSFW_VIOLATION: "Posting NSFW content.",
    UNDERAGE_USER: "Being under the age of 12, violating Discord ToS."
}

const MUTE_PREREASONS = {
    SPAMMING: "Spamming excessively in a chat.",
    CURSING: "Cursing excessively in a chat.",
    BULLYING: "Bullying another member.",
    FOREIGN_LANGUAGE: "Speaking in a foreign language.",
    MINI_MODDING: "Mini-modding.",
    CREATING_DRAMA: "Creating drama in the chat.",
    SPECIAL_CHARACTERS: "Using special characters excessively in a chat.",
    CAPS_LOCK: "Typing in all caps excessively in a chat.",
    ADVERTISING: "Advertising a server or website.",
    INAPPROPRIATE_CONTENT: "Talking about inappropriate things in a chat.",
}

const AWAY_PREREASONS = {
    LUNCH: "Having lunch!",
    DINNER: "Having (a lovely) dinner!",
    MEETING: "In a Meeting right now.",
    WORK: "Busy at work.",
    SCHOOL: "At school...",
    STUDY: "Studying...",
    SLEEP: "Sleeping. Zzzz...",
    BREAK: "Taking a break.",
    AFK: "AFK"
}

module.exports = { KICK_PREREASONS, BAN_PREREASONS, WARN_PREREASONS, MUTE_PREREASONS, AWAY_PREREASONS }