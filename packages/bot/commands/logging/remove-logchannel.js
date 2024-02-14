const { getRequest, deleteRequest } = require("../../database/connection")
const { createCustomEmbed } = require("../../assets/embed")
const { formatExpression } = require("../../lib/helpers/StringHelpers/stringHelper")
const { LOGGING_CATEGORIES } = require("../../assets/logging")
const {ERROR, WARNING, SUCCESS} = require("../../assets/embed-colors")
const { GetLogTypeByKeyOrValue } = require("../../config/LogTypes")

module.exports.props = {
    commandName: "remove-logchannel",
    description: "Removes the saved log channel for the specified log type.",
    usage: "/remove-logchannel [log-type]",
    interaction: {
        type: 1,
        permissionType: [],
        options: [
            {
                name: "log-type",
                type: 3,
                description: "Type of log to set the channel for.",
                required: true,
				autocomplete: true,
				maxLength: 100,
				minLegnth: 4
            }
        ],
    },
    defaultMemberPermissions: ['ManageGuild'],
}

module.exports.autocomplete = async (client, interaction) => {
    const focusedReason = interaction.options.getFocused();

    // Get and format the pre-reasons
    const reasons = Object.keys(LOGGING_CATEGORIES).map(reason =>
        ({ name: formatExpression(reason), value: LOGGING_CATEGORIES[reason] })
    );

    // Get the focussed reason && return the filtered reason
    const filteredReasons = reasons.filter(reason => reason.name.toLowerCase().includes(focusedReason.toLowerCase()));
    interaction.respond(filteredReasons);
}


module.exports.run = async (client, interaction) => {

	// Get the logTypeCategory from the interaction options.
	const logObject = await GetLogTypeByKeyOrValue(interaction.options.get("log-type").value);
	const logTypeCategory = Object.keys(logObject)[0];
	const logTypeCategoryName = Object.values(logObject)[0];

	console.log(`The Interation option is:`, interaction.options.get("log-type").value)

	// Send the request to check if the log channel exists
	const logChannelResponse = await getRequest(`/logchannels/${interaction.guild.id}/${logTypeCategory}`);

	// If there is no log channel for the logTypeCategory, create one
	if (logChannelResponse.status === 404) {
		
		// Send an embed saying that the log channel for the logTypeCategory does not exist
		sendEmbed(interaction, `No log channel`, `> There is no channel set for logging \`${logTypeCategoryName}\`.`, ERROR);

	} else if (logChannelResponse.status === 200) { // If the log channel for the logTypeCategory exists, update it

		// Update the log channel for the logTypeCategory
		const logChannelDeleteResponse = await deleteRequest(`/logchannels/${interaction.guild.id}/${logTypeCategory}`);

		console.log(logChannelDeleteResponse)
		// If the request was successful, return success message
		if (logChannelDeleteResponse.status === 200) {			
			// Send the success embed
			sendEmbed(interaction, `Log channel removed`, `> Successfully removed the log channel for \`${logTypeCategoryName}\`.`, SUCCESS);
		} else {
			// If the request was not successful, return an error
			sendErrorResponse(interaction, `An error occurred while trying to delete the log channel for \`${logTypeCategoryName}\`.`);
		}
		
	} else {
		// If the request was not successful, return an error
		sendEmbed(interaction, "Error", "An error occurred while deleting the log channel.", ERROR);
	}
}


// Send a success embed
const sendEmbed = (interaction, embedTitle, embedDescription, color) => {
	const embed = createCustomEmbed({
		title: embedTitle,
		description: embedDescription,
		timestamp: new Date(),
		color: color,
		footer: {
			text: `Requested by ${interaction.user.tag}`,
			iconURL: interaction.user.displayAvatarURL({ dynamic: true })
		}
	});

	return interaction.reply({
		embeds: [embed],
	});
};

// Send an error response message
const sendErrorResponse = (interaction, response) => {
	return interaction.reply({
		content: response,
		ephemeral: true
	});
};