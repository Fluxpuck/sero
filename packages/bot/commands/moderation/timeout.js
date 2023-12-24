const {MUTE_PREREASONS} = require("../../assets/reason-messages");
const {formatExpression} = require("../../lib/helpers/StringHelpers/StringHelper")
module.exports.props = {
    commandName: "timeout",
    description: "Puts a user into a muted state, and does not allow them to chat.",
    usage: "/mute [user] [time] [reason]",
    private: true,
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
        options: // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
            [
                {
                    name: "member",
                    type: 6,
                    description: "The user you want to mute.",
                    required: true

                },
                {
                    name: "time",
                    type: 3,
                    description: "Predetermined times to mute this user.",
                    choices: [
                        { name: "5 Minutes", value: "5m"},
                        { name: "10 Minutes", value: "10m" },
                        { name: "20 Minutes", value: "20m"},
                        { name: "1 Hour", value: "60m" },
                        { name: "12 Hours", value: "720m" },
                        { name: "1 day", value: "1440m" }
                    ],
                    required: true
                },
                {
                    name: "reason",
                    type: 3,
                    description: "User set reason.",
                    required: true,
                    autocomplete: true
                },
            ],
    }
}
module.exports.autocomplete = async (client, interaction) => {
    const focusedReason = interaction.options.getFocused();

    // Get and format the pre-reasons
    const reasons = Object.keys(MUTE_PREREASONS).map(reason =>
        ({ name: formatExpression(reason), value: MUTE_PREREASONS[reason] })
    );

    // Get the focussed reason && return the filtered reason
    const filteredReasons = reasons.filter(reason => reason.name.toLowerCase().includes(focusedReason.toLowerCase()));
    interaction.respond(filteredReasons);
}


module.exports.run = async (client, interaction) => {
const apiUser = interaction.options.get("member").user;
const member = interaction.guild.members.cache.find(user => user.id === apiUser.id)
if(!member) interaction.reply({ content: `The member you provided was not a proper member.` });
const time = interaction.options.get("time")
const reason = interaction.options.get("reason").value;
const muteTime = Number(time.value.replace('m', ''));
const duration = Number.isInteger(muteTime) ? muteTime * 60 * 1000 : false

member.timeout(duration, `${reason}`)
interaction.reply({ content: `Muted <@${apiUser.id}> for **${muteTime} minutes** with the reason ${reason}`})
}