const { getRequest, deleteRequest } = require("../../database/connection")
const { createCustomEmbed } = require("../../assets/embed")
const { formatExpression } = require("../../lib/helpers/StringHelpers/stringHelper")
const { LOGGING_CATEGORIES } = require("../../assets/log-categories")

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
	await interaction.deferReply({ ephemeral: false });

	// Get logTypeCategory from the interaction options
	const targetLogCategory = interaction.options.get("log-type").value;

	// If the logTypeCategory is not valid, return an error
	if (!Object.values(LOGGING_CATEGORIES).includes(targetLogCategory)) {
		return interaction.editReply({
			content: `Oops! The log-type you provided is not valid`,
			ephemeral: true
		})
	}

	// Check if the target logTypeCategory is set in the database
	const logChannelResult = await getRequest(`/logchannels/${interaction.guild.id}/${targetLogCategory}`);
	if (logChannelResult.status == 200) {

		// Remove the log channel for the logTypeCategory
		const deleteResponse = await deleteRequest(`/logchannels/${interaction.guild.id}/${targetLogCategory}`);
		if (deleteResponse.status !== 200) {
			return interaction.editReply({
				content: `Something went wrong while removing the log-channel \`${targetLogCategory}\`.`,
				ephemeral: true
			})
		} else {
			return interaction.editReply({
				content: `The log-channel for \`${targetLogCategory}\` has been removed.`,
				ephemeral: true
			})
		}

	} else {
		return interaction.editReply({
			content: "Cannot remove the log-channel for the specified log type.",
			ephemeral: true
		})
	}

}