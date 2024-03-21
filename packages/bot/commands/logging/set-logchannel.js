const { getRequest, postRequest } = require("../../database/connection")
const { createCustomEmbed } = require("../../assets/embed")
const { formatExpression } = require("../../lib/helpers/StringHelpers/stringHelper")
const { LOGGING_CATEGORIES } = require("../../assets/logging")
const { ERROR, WARNING, SUCCESS } = require("../../assets/embed-colors")
const { GetLogTypeByKeyOrValue } = require("../../lib/discord/auditlogevent");

module.exports.props = {
	commandName: "set-logchannel",
	description: "Sets the channel for logging moderation and other actions",
	usage: "/set-logchannel [log-type] [channel]",
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
			},
			{
				name: "channel",
				type: 7,
				description: "Channel to set to log actions in.",
				required: true,
				channelTypes: [0]
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

	// Get the target log channel from the interaction options
	const targetLogChannel = interaction.options.getChannel("channel");
	// Get the logTypeCategory from the interaction options. 
	const logObject = await GetLogTypeByKeyOrValue(interaction.options.get("log-type").value);

	// If the logTypeCategory is not valid, return an error
	if (!logObject) {
		return interaction.reply({
			content: ':x: The log type you provided is not valid.',
			ephemeral: true,
		});
	}

	// Get the logTypeCategory and logTypeCategoryName from the logObject
	const logTypeCategory = Object.keys(logObject)[0];
	const logTypeCategoryName = Object.values(logObject)[0];

	// Fetch the current guild logchannel for the logTypeCategory
	const logChannelResponse = await getRequest(`/logchannels/${interaction.guild.id}/${logTypeCategory}`);

	// If there is no log channel for the logTypeCategory, create one
	if (logChannelResponse.status === 404) {

		const logChannelPostResponse = await postLogChannel(interaction.guild.id, logTypeCategory, targetLogChannel.id)

		// If the request was successful, return success message
		if (logChannelPostResponse.status === 200) {

			// Send the success embed
			sendEmbed(interaction, "Set log channel.", `The log channel for \`${logTypeCategoryName}\` has been set to <#${targetLogChannel.id}>.`, SUCCESS);

		} else {
			// If the request was not successful, return an error
			return interaction.reply({
				content: `An error occurred while setting the log channel for **${logTypeCategoryName}**.`,
				ephemeral: true,
			});
		}
	} else if (logChannelResponse.status === 200) { // If the log channel for the logTypeCategory exists, update it

		// Update the log channel for the logTypeCategory
		const logChannelPostResponse = await postLogChannel(interaction.guild.id, logTypeCategory, targetLogChannel.id)

		// If the request was successful, return success message
		if (logChannelPostResponse.status === 200) {
			// Send the success embed
			sendEmbed(interaction, "Updated log channel.", `The log channel for \`${logTypeCategoryName}\` has been updated to <#${targetLogChannel.id}>. You will now receive logs for \`${logTypeCategoryName}\` in <#${targetLogChannel.id}>.`, WARNING);
		} else {
			// If the request was not successful, return an error
			return interaction.reply({
				content: `An error occurred while updating the log channel for \`${logTypeCategoryName}\`.`,
				ephemeral: true,
			})
		}

	} else {
		// If the request was not successful, return an error
		sendEmbed(interaction, "Error", "An error occurred while setting the log channel.", ERROR);
	}
}

// Post the log channel via the API
const postLogChannel = async (guildId, logTypeCategory, channelId) => {
	// logchannels/:guildId/:category
	const response = await postRequest(`/logchannels/${guildId}/${logTypeCategory}`, {
		channelId: channelId
	});

	return response;
}

// Embeds
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