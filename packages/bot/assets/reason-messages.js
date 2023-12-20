const KICK_PREREASONS = {
    IMPERSONATION: "%user% was kicked for impersonation.",
    INAPPROPRIATE_USENRNAME: "%user% was kicked for having an innapropriate username.",
    ALT_ACCOUNT: "%user% was kicked for having an alt account."
}
const BAN_PREREASONS = {
    MULTIPLE_VIOLATIONS: "%user% was banned for multiple server rule infringements.",
    RACIAL_SLURS: "%user% was banned for using racial slurs in chat.",
    DISCORD_TOS_VIOLATION: "%user% was banned for violating Discord Terms of Service",
    NSFW_VIOLATION: "%user% was banned for posting NSFW content.",
    UNDERAGE_USER: "%user% was banned for being under the age of 12, violating Discord ToS."
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

module.exports = { KICK_PREREASONS, BAN_PREREASONS, WARN_PREREASONS }