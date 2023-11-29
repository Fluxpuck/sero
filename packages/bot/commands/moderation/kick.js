const { KICK_PREREASONS } = require("../../assets/pre-reasons");

module.exports.props = {
    commandName: "kick",
    description: "Kick a user from the server.",
    usage: "/kick [user] [reason] [prereason?]",
    private: true,
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
        options: // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
            [
                {
                    name: "member",
                    type: 6,
                    description: "The user you want to kick.",
                    required: true

                },
                {
                    name: "reason",
                    type: 3,
                    description: "User set reason.",
                    required: false,
                },
                {
                    name: "prereason",
                    type: 3,
                    description: "A list of predetermined reasons.",
                    choices: [
                        { name: "Impersonation", value: "IMPERSONATION" },
                        { name: "Inappropriate User", value: "INAPPROPRIATE_USER" },
                        { name: "Alt Account", value: "ALT_ACCOUNT" },
                    ],
                    required: false 
                },
              
            ],
    }
}

module.exports.run = async (client, interaction) => {
const apiUser = interaction.options.get("member").user;
const member = interaction.guild.members.cache.find(user => user.id === apiUser.id)
if(!member) interaction.reply({ content: `The member you provided was not a proper member.` });
const PreReasonOption = interaction.options.get("prereason");
const user_reason = interaction.options.get("reason");

if(user_reason && prereasonopt) {
    interaction.reply({ content: `There can only be one reason.`})
}
switch (PreReasonOption.value) {
    case "IMPERSONATION":
        member.kick(KICK_PREREASONS.IMPERSONATION.replace("%user%", "{FLUX}"))
        interaction.reply({ content: `${KICK_PREREASONS.IMPERSONATION.replace('%user%', `${member}`)}`})
        break;
        case "INNAPROPRIATE_USER":
            member.kick(KICK_PREREASONS.INAPPROPRIATE_USER.replace("%user%", `{FLUX}`))
            interaction.reply({ content: `${KICK_PREREASONS.INAPPROPRIATE_USENRNAME.replace(`%user%`, `${member}`)}`})
            break;
            case "ALT_ACCOUNT":
                member.kick(KICK_PREREASONS.ALT_ACCOUNT.replace("%user%", `{FLUX}`))
                interaction.reply({ content: `${KICK_PREREASONS.ALT_ACCOUNT.replace('%user%', `${member}`)}`})
                break;
                default:
                    member.kick(user_reason)
                    interaction.reply({ content: `Kicked ${member} for ${user_reason}`})
}




}