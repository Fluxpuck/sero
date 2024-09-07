const { getRequest } = require("../../database/connection");
const { createRankCard } = require("../../lib/canvas/rank");

module.exports.props = {
	commandName: "rank",
	description: "Check the rank of a user.",
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
	},
	defaultMemberPermissions: ['SendMessages'],
	cooldown: 2 * 60, // 2 minute cooldown
}

module.exports.run = async (client, interaction) => {

	// Prevent the command from being overflooded and limited by Discord
	if (interaction.replied || interaction.deferred) {
		await interaction.deleteReply();
		return interaction.followUp({
			content: "Oops! The command is on a cooldown! Please wait a bit before trying again.",
			ephemeral: true
		})
	}

	await interaction.deferReply({ ephemeral: false });

	// Get User details from the interaction options
	const targetUser = interaction.options.get("user")?.user || interaction.user;
	if (!targetUser) {
		await interaction.deleteReply();
		return interaction.followUp({
			content: "Oops! Something went wrong while trying to fetch the user.",
			ephemeral: true
		})
	}

	// Add the user to a 2 minute cooldowns
	client.cooldowns.set(cooldown_key, interaction, 2 * 60); // Minutes * Seconds

	// Get the user experience
	const result = await getRequest(`/guilds/${interaction.guildId}/levels/${targetUser.id}`);

	// If status code is 404, return an error saying the user is not ranked yet
	if (result?.status === 404) {
		await interaction.deleteReply();
		return interaction.followUp({
			content: `Uh oh! The user ${targetUser.username} has no rank yet!`,
			ephemeral: true
		})
	} else if (result?.status !== 200) { // If the status code is not 200, return an error that something went wrong
		await interaction.deleteReply();
		return interaction.followUp({
			content: "Oops! Something went wrong while trying to fetch the rank!",
			ephemeral: true
		})
	}

	// Get request details
	const { level, experience, position, nextLevelExp, remainingExp, } = result.data;

	// Get the user's rank card
	const rankCard = await createRankCard(
		targetUser.id,
		targetUser.username,
		targetUser.displayAvatarURL({ forceStatic: true, extension: "png", size: 1024 }),
		position,
		experience,
		level,
		nextLevelExp,
		remainingExp
	);

	// If creating the rank card was successful, return rankcard
	if (rankCard) {
		interaction.editReply(
			{ files: [rankCard] }
		)
	} else { // Else return an error
		await interaction.deleteReply();
		interaction.followUp({
			content: "Oops! Something went wrong creating your rank card!",
			ephemeral: true
		})
	}

}