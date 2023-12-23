```js
module.exports.props = {
	commandName: "name",
	description: "This is an example",
	usage: "/name [user]",
	interaction: {
		type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
		permissionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandPermissionType  
		options: [
			{
				name: "username",
				type: 3,
				description: "The user you are looking for",
				required: true
			}
		], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
	}
}
```