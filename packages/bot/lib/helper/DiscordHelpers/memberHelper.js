const { GuildMember } = require('discord.js');

module.exports = {

	/**
	 * Formats the roles of a member into a string. If the member has more than 25 roles, it will only display the first 25 roles.
	 * @param {GuildMember} member - The member to format the roles of.
	 * @returns {string} - The formatted roles.
	 */
	formatMemberRoles: (member) => {
		// Get all the roles of the member, excluding the default guild role
		let roles = member.roles.cache
			.filter((r) => r.id !== member.guild.id)
			.sort((a, b) => b.position - a.position)
			.map((r) => r);

		// If the member has more than 25 roles, truncate the roles array and display the count of remaining roles
		roles.length > 25
			? (roles = roles.slice(0, 25) + ` ${roles.length - roles.slice(0, 25).length} more...`)
			: (roles = roles);

		// Return the formatted roles or 'None' if the member has no roles
		return roles ? roles : `\`None\``;	
	},

	/**
	 * Gets the join position of a member.
	 * @param {GuildMember} member - The member to get the join position of.
	 * @returns {number} - The join position of the member.
	 */
	getMemberJoinPosition: (member) => {
		// Get the join position of the member
		const joinPosition = Array.from(member.guild.members.cache)
			.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
			.findIndex((m) => m[0] === member.id);

		// Return the join position of the member
		return joinPosition;
	},

	/**
	 * Gets the join order of a member.
	 * @param {Guild} guild - The guild to get the join order of the member in.
	 * @param {string} memberId - The ID of the member to get the join order of.
	 * @param {number} iterationCount - The number of members to include in the join order.
	 * @returns {string} - The join order of the member.
	 * @example
	 * // Returns the join order of the member in the guild
	 * getMemberJoinOrder(guild, memberId);
	 * @example
	 * // Returns the join order of the member in the guild, including 5 members before and after the member
	 * getMemberJoinOrder(guild, memberId, 5);
	 * @example
	 * // Returns the join order of the member in the guild, including 10 members before and after the member
	 * getMemberJoinOrder(guild, memberId, 10);
	 */
	getMemberJoinOrder: (guild, memberId, iterationCount) => {

		// Check if the member exists in the guild
		if (!guild.members.cache.findKey(m => m.user.id === memberId)) return null;

		// Sort the members by join timestamp
		let sortArr = Array.from(guild.members.cache.values()).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);

		// Find the index of the member in the sorted array
		let memberIndex = sortArr.findIndex(m => m.user.id === memberId);

		// Initialize an array to store the join position information
		let joinPositionArray = [{
			member: sortArr[memberIndex],
			index: memberIndex
		}];

		// Add members before the target member to the join position array
		for (let i = 1; i < (typeof iterationCount === "number" ? iterationCount + 1 : 6); i++) {
			if (sortArr[memberIndex - i]) joinPositionArray.unshift({
				member: sortArr[memberIndex - i],
				index: memberIndex - i
			});
		}

		// Add members after the target member to the join position array
		for (let j = 1; j < (typeof iterationCount === "number" ? iterationCount + 1 : 6); j++) {
			if (sortArr[memberIndex + j]) joinPositionArray.push({
				member: sortArr[memberIndex + j],
				index: memberIndex + j
			});
		}

		// Format the join position array and return the result
		return joinPositionArray.map(obj => obj.member.user.tag === guild.members.cache.get(memberId).user.tag ? `**${obj.member.user.tag}**` : `\`${obj.member.user.tag}\``).join(' ➜ ');
	}
};