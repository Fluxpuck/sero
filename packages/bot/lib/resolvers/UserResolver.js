/**
 * @file UserResolver.js
 * @description This file contains the UserResolver module, which provides functions for finding users in a guild based on different identifiers.
 */

const { Guild } = require('discord.js');
const { regEscape } = require('../helpers/StringHelpers/stringHelper');

module.exports = {

	/**
	 * Finds a user in a guild based on a user identifier.
	 * The identifier can be a mention, user ID, or username.
	 * @param {Guild} guild - The guild to search for the user in.
	 * @param {any} user - The user identifier. can be mention, Id, or username.
	 * @param {boolean} exact - Whether to perform an exact match for the username.
	 * @returns {User|null} - The found user or null if not found.
	 */
	findUser: (guild, user, exact) => {
		if (!user) return null;

		// check if it's a mention
		let mentionId = new RegExp('<@!?([0-9]+)>', 'g').exec(user);

		if (mentionId && mentionId.length > 1) {
			return guild.members.cache.find(u => u.user.id === mentionId[1]);
		}

		// check if it's an id
		if (user.match(/^([0-9]+)$/)) {
			let userIdSearch = guild.members.cache.find(u => u.user.id === user);
			if (userIdSearch) return userIdSearch;
		}

		let exactNameSearch = guild.members.cache.find(
			u => u.user.username === user
		);
		if (exactNameSearch) return exactNameSearch;

		if (!exact) {
			const escapedUser = regEscape(user)
			// username match
			let userNameSearch = guild.members.cache.find(u =>
				u.user.username.match(new RegExp(`^${escapedUser}.*`, 'i'))
			);
			if (userNameSearch) return userNameSearch;
		}

		return null;
	},

	/**
	 * Finds users in a guild based on a partial username match.
	 * @param {Guild} guild - The guild to search for the users in.
	 * @param {string} user - The partial username to search for.
	 * @param {boolean} fetchFromCache - Whether to fetch the members from cache or not.
	 * @returns {Promise<Array<User>>} - A promise that resolves to an array of found users.
	 */
	findUsersFromName: async (guild, user, fetchFromCache = true) => {

		if (!user) return null;

		let members = await guild.members.search({
			limit: 6,
			query: user,
			cache: fetchFromCache
		}).catch((error) => { return console.error(error); });

		return members;
	},
}