const { KICK_PREREASONS } = require("../../assets/reason-messages");
const { formatExpression } = require("../../lib/helpers/StringHelpers/StringHelper")

module.exports.props = {
    commandName: "kick",
    description: "Kicks a user from the server.",
    usage: "/kick [user] (reason)",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "Select a user to warn",
                type: 6,
                required: true,
            },
            {
                name: "reason",
                description: "Type a reason to warn the user",
                type: 3,
                required: true,
                autocomplete: true,
            },
        ],
    },
};
module.exports.autocomplete = async(client, interaction) => {
    const focusedReason = interaction.options.getFocused();

    // Get and format the pre-reasons
    const reasons = Object.keys(KICK_PREREASONS).map(reason =>
        ({ name: formatExpression(reason), value: KICK_PREREASONS[reason] })
    );

    // Get the focussed reason && return the filtered reason
    const filteredReasons = reasons.filter(reason => reason.name.toLowerCase().includes(focusedReason.toLowerCase()));
    interaction.respond(filteredReasons);
}

module.exports.run = async (client, interaction) => {
    const apiUser = interaction.options.get("user").user;
    const member = interaction.guild.members.cache.find(user => user.id === apiUser.id)
    if (!member) interaction.reply({ content: `The member you provided was not a proper member.` });
    const reason = interaction.options.get("reason").value;
    if(apiUser.id === interaction.user.id) { return interaction.reply({ content: `You cannot kick yourself.` })}
    
    member.kick(reason)
    interaction.reply({ content: `${apiUser} was kicked for ${reason}`})
}