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
	}
}

module.exports.run = async (client, interaction) => {

	// Get User details from the interaction options
	const targetUser = interaction.options.get("user")?.user || interaction.user;
	if (!targetUser) {
		return interaction.reply({
			content: "Oops! Something went wrong while trying to fetch the user.",
			ephemeral: true
		})
	}

	/**
	  * This code whas a 24 hour cooldown per user
	  */
	const cooldownKey = targetUser.id + interaction.id
	if (client.cooldowns.has(cooldownKey) === false) {

		// Get the user experience
		const result = await getRequest(`/levels/${interaction.guildId}/${targetUser.id}`);

		// If status code is 404, return an error saying the user is not ranked yet
		if (result.status === 404) {
			return interaction.reply({
				content: `Uh oh! The user ${targetUser.username} is no rank yet!`,
				ephemeral: true
			})
		} else if (result.status !== 200) { // If the status code is not 200, return an error that something went wrong
			return interaction.reply({
				content: "Oops! Something went wrong while trying to fetch the rank!",
				ephemeral: true
			})
		}

		// Get request details
		const { userLevel, position } = result.data;
		const { level, experience, nextLevelExp, remainingExp } = userLevel;

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
			interaction.reply(
				{ files: [rankCard] }
			)
		} else {
			// Else return an error
			interaction.reply({
				content: "Oops! Something went wrong creating your rank card!",
				ephemeral: true
			})
		}

		// Add the user to the cooldowns Collection
		return client.cooldowns.set(cooldownKey, interaction, 0 * 2 * 60) // 2 minutes
	} else {
		return interaction.reply({
			content: `You can only check your rank every 2 minutes!`,
			ephemeral: true
		})
	}
}