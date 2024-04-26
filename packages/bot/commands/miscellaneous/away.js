const { AWAY_PREREASONS } = require("../../assets/reason-messages");
const { postRequest } = require("../../database/connection");
const { formatExpression } = require("../../lib/helpers/StringHelpers/stringHelper");

module.exports.props = {
    commandName: "away",
    description: "Let everyone know you're away",
    usage: "/away (time) (message)",
    interaction: {
        type: 1,
        options: [
            {
                name: "time",
                type: 10,
                description: "The amount (in minutes) of time you want to be away for (defaults to 5 minutes)",
                required: false,
                minValue: 5,
                maxValue: 720,
                autocomplete: true
            },
            {
                name: "message",
                description: "The reason you are away",
                type: 3,
                required: false,
                autocomplete: true,
                maxLength: 250,
            },
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.autocomplete = async (client, interaction) => {
    const focusedReason = interaction.options.getFocused(true);
    if (focusedReason.name === "time") {
        defaultTimes = [
            { name: "5 minutes", value: "5" },
            { name: "10 minutes", value: "10" },
            { name: "20 minutes", value: "20" },
            { name: "30 minutes", value: "30" },
            { name: "1 hour", value: "60" },
            { name: "2 hours", value: "120" }
        ];
        if (focusedReason.value) {
            const filteredTimes = defaultTimes.filter(time => time.name.toLowerCase().includes(focusedReason.value.toLowerCase()));
            await interaction.respond(filteredTimes);
            return;
        }
        await interaction.respond(defaultTimes);
        return;
    }
    if (focusedReason.name === "message") {
        const reasons = Object.keys(AWAY_PREREASONS).map(reason =>
            ({ name: formatExpression(reason), value: AWAY_PREREASONS[reason] })
        );

        const filteredReasons = reasons.filter(reason => reason.name.toLowerCase().includes(focusedReason.value.toLowerCase()));
        await interaction.respond(filteredReasons);
        return;
    }
}

module.exports.run = async (client, interaction) => {
    // Get Away time value from the interaction options
    const timeOption = interaction.options.get("time")?.value;
    const timeInMinutes = timeOption ?? 5; // Default to 5 minutes
    const messageOption = interaction.options.get("message")?.value;

    // Give the user the experience
    const result = await postRequest(`/away/${interaction.guildId}/${interaction.user.id}`, { duration: timeInMinutes, message: messageOption});

    // If the request was not successful, return an error
    if (result.status !== 200) {
        return interaction.reply({
            content: "Something went wrong while setting your away status.",
            ephemeral: true
        })
    } else {
        var content = `<@${interaction.user.id}> will be away for **${timeInMinutes}** minutes!`;
        if (interaction.options.get("message")) {
            const reason = interaction.options.get("message")?.value;
            content += `\n Reason: **${reason}**`;
        }
        return interaction.reply({
            content: content,
            ephemeral: false
        }).then(msg => {
            setTimeout(() => {
                msg.delete();
            }, 8000); // 8 seconds
        });

    }

}