module.exports.props = {
    commandName: "update-commands",
    description: "Fetch client commands, push to database and create/update application commands",
    usage: "/update-commands",
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
        options: // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
            [
                {
                    name: "type",
                    type: 3,
                    description: "The type of update to perform",
                    choices: [
                        { name: "Remove all commands", value: "REMOVE_ALL" },
                        { name: "Fetch all commands", value: "SAVE_ALL" },
                        { name: "Update all commands", value: "UPDATE_ALL" },
                    ],
                    required: true
                }
            ],
    }
}

const CommandType = {
    REMOVE_ALL: "REMOVE_ALL",
    SAVE_ALL: "SAVE_ALL",
    UPDATE_ALL: "UPDATE_ALL",
};

module.exports.run = async (client, interaction) => {
    const commandOption = interaction.options.get('type')

    switch (commandOption.value) {
        case CommandType.REMOVE_ALL:


            break;
        case CommandType.SAVE_ALL:


            break;
        case CommandType.UPDATE_ALL:


            break;
        default:
            break;
    }
}
