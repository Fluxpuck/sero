const { getRequest } = require("../../database/connection");
const { createRankCard } = require("../../lib/canvas/rank");

module.exports.props = {
	commandName: "rank",
	description: "Get a user's rank if user is mentioned, or get your own rank if no user is mentioned.",
	usage: "/rank [user]",
	interaction: {
		type: 1,
		options: [
			{
				name: "user",
				type: 6,
				description: "The user you want to get the rank of",
				required: false,
			},
		],
	}
}

module.exports.run = async (client, interaction) => {

	// Get User details from the interaction options
	const targetUser = interaction.options.get("user")?.user || interaction.user;
	if (!targetUser) {
		return interaction.reply({
			content: "Oops! Something went wrong while trying to fetch the user",
			ephemeral: true
		})
	}

	// Get the user experience
	const result = await getRequest(`/levels/${interaction.guildId}/${targetUser.id}`);

	// If the request was not successful, return an error
	if (result.status !== 200) {
		return interaction.reply({
			content: "Oops! Something went wrong while trying to fetch the rank",
			ephemeral: true
		})
	}

	// Get request details
	const { userLevel, position } = result.data;
	const { level, experience, nextLevelExp, currentLevelExp } = userLevel;

	// Get the user's rank card
	const rankCard = await createRankCard(
		targetUser.id,
		targetUser.username,
		targetUser.displayAvatarURL({ forceStatic: true, extension: "png", size: 1024 }),
		position,
		experience,
		level,
		nextLevelExp,
		currentLevelExp
	);

	// If creating the rank card was not successful, return an error
	if (!rankCard) {
		return interaction.reply({
			content: "Oops! Something went wrong creating your rank card",
			ephemeral: true
		})
	}

	// Return embed with rank details
	return interaction.reply(
		{ files: [rankCard] }
	)
}