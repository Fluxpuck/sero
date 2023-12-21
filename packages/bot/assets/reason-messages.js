const KICK_PREREASONS = {
    IMPERSONATION: "impersonation.",
    INAPPROPRIATE_USENRNAME: " having an innapropriate username.",
    ALT_ACCOUNT: "having an alt account."
}
const BAN_PREREASONS = {
    MULTIPLE_VIOLATIONS: "multiple server rule infringements.",
    RACIAL_SLURS: "saying racial slurs in a chat.",
    DISCORD_TOS_VIOLATION: "was banned for violating Discord Terms of Service.",
    NSFW_VIOLATION: "was banned for NSFW violations.",
    UNDERAGE_USER: "was banned for being under the age of 12 violating Discord Terms of Service."
}

const WARN_PREREASONS = {
    IMPERSONATION: "Impersonation of a staff member of another user.",
    INAPPROPRIATE_USERNAME: "Innapropriate username.",
    ALT_ACCOUNT: "Alt account.",
    MULTIPLE_VIOLATIONS: "Multiple server rule infringements.",
    RACIAL_SLURS: "Using racial slurs in chat.",
    DISCORD_TOS_VIOLATION: "Violating Discord Terms of Service",
    NSFW_VIOLATION: "Posting NSFW content.",
    UNDERAGE_USER: "Being under the age of 12, violating Discord ToS."
}
const MUTE_PREREASONS = {
    SPAMMING:  "for spamming the chat.",
    CURSING: "for cursing excessively in chat.",
    BULLYING: "for bullying another member.",
    FOREIGN_LANGUAGE: "for speaking in a foreign language.",
    MINI_MODDING: "for mini-modding.",
    CREATING_DRAMA: "for creating drama in the chat."
}


module.exports = { KICK_PREREASONS, BAN_PREREASONS, WARN_PREREASONS, MUTE_PREREASONS }