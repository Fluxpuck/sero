const { GuildMemberManager } = require('discord.js')

module.exports = {

	findUser: (findUser = (guild, user, exact) => {
		if (!user) return null;

		// check if it's a mention
		let mentionId = new RegExp('<@!?([0-9]+)>', 'g').exec(user);

		if (mentionId && mentionId.length > 1) {
			return guild.members.cache.find(u => u.user.id === mentionId[1]);
		}

		// check if it's username#1337
		if (user.indexOf('#') > -1) {
			let [name, discrim] = user.split('#'),
				nameDiscrimSearch = guild.members.cache.find(
					u => u.user.username === name && u.user.discriminator === discrim
				);
			if (nameDiscrimSearch) return nameDiscrimSearch;
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
			const escapedUser = this.regEscape(user)
			// username match
			let userNameSearch = guild.members.cache.find(u =>
				u.user.username.match(new RegExp(`^${escapedUser}.*`, 'i'))
			);
			if (userNameSearch) return userNameSearch;
		}

		return null;
	}),

	/**
	 * @property {GuildMemberManager} guild.members
	 */
	findUserFromName: (findUserFromName = (guild, user) => {

		if (!user) return null;

		let members = guild.members.search({
			limit: 10,
			query: user,
			cache: true
		})

		console.log(members);
	}),
}