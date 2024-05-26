const { getRequest, postRequest } = require("../../database/connection")
const { createCustomEmbed } = require("../../assets/embed")
const { formatExpression } = require("../../lib/helpers/StringHelpers/stringHelper")
const { LOGGING_CATEGORIES } = require("../../assets/log-categories")

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
	await interaction.deferReply({ ephemeral: false });

	// Get logTypeCategory && targetChannel from the interaction options
	const targetLogCategory = interaction.options.get("log-type").value;
	const targetChannel = interaction.options.getChannel("channel");

	// If the logTypeCategory is not valid, return an error
	if (!Object.values(LOGGING_CATEGORIES).includes(targetLogCategory)) {
		return interaction.editReply({
			content: `Oops! The log-type you provided is not valid`,
			ephemeral: true
		})
	}

	// Create or update the log channel for the logTypeCategory
	const result = await postRequest(`/logchannels/${interaction.guild.id}/${targetLogCategory}`, {
		channelId: targetChannel.id
	});

	// If the request was not successful, return an error
	if (result?.status !== 200) {
		return interaction.editReply({
			content: `Something went wrong while setting the log-channel \`${targetLogCategory}\`.`,
			ephemeral: true
		})
	} else {
		return interaction.editReply({
			content: `The log-channel for \`${targetLogCategory}\` has been set to <#${targetChannel.id}>.`,
			ephemeral: true
		})
	}
}