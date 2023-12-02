// Constructs pre-reasons so we can pull them easier. 

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

module.exports = { KICK_PREREASONS, BAN_PREREASONS }