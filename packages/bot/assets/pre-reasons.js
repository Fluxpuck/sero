// Constructs pre-reasons so we can pull them easier. 

const KICK_PREREASONS = {
    IMPERSONATION: "%user% was kicked for impersonating another member/celebrity.",
    INAPPROPRIATE_USER: "%user% was kicked for having an innapropriate username.",
    ALT_ACCOUNT: "%user% was kicked for having an alt account."
}

const BAN_PREREASONS = {
    MULTIPLE_VIOLATIONS: "%user% was banned for multiple server rule violations.",
    N_WORD_USAGE: "%user% was banned for using racial slurs in chat.",
    DIS_TOS_VIOLATION: "%user% was banned for violating Discord Terms of Service",
    NSFW_VIOLATION: "%user% was banned for posting NSFW in a chat.",
    UNDERAGE_USER: "%user% was banned for being under the age to use Discord - 12 or below."
}

module.exports = { KICK_PREREASONS, BAN_PREREASONS }