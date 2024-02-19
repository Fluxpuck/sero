const LogTypes = {
	'memberEvents': 'Member Events',
	'emojiEvents': 'Emoji Events',
	'roleEvents': 'Role Events',
	'messageEvents': 'Message Events',
	'stickerEvents': 'Sticker Events',
	'inviteEvents': 'Invite Events'
}

module.exports = {
	async GetLogTypeByKeyOrValue(logType) {
		// find the key from the value or the value from the key and return it as { key: value }
		const entry = Object.entries(LogTypes).find(([key, value]) => key === logType || value === logType);
		if (entry) {
			return { [entry[0]]: entry[1] };
		}
		return null; // Return null if no match found
	},

	async GetLogTypeByKey(logType) {
		// return the value of the key
		return LogTypes[logType];
	},
}