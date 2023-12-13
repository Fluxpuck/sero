const { ActionRowBuilder, ComponentType, InteractionResponse, Embed, ButtonBuilder, StringSelectMenuBuilder, GuildMember } = require('discord.js');

const { findUser, findUsersFromName } = require("../../lib/resolvers/UserResolver");

const { createCustomEmbed } = require('../../assets/embed');
const { createCustomDropdown } = require('../../assets/embed-dropdowns');
const { ERROR, BASE_COLOR } = require('../../assets/embed-colors');
const { SEARCH, INFO } = require('../../assets/embed-buttons');

// Button IDs
const SEARCH_BUTTON_ID = 'search';
const INFO_BUTTON_ID = 'info';

module.exports.props = {
	commandName: "search-member",
	description: "Search for a member in the server and get information on them.",
	usage: "/search-member [<username>|<a string that matches their name>]",
	interaction: {
		type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
		permissionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandPermissionType  
		options: [
			{
				name: "username",
				type: 3,
				description: "The user that you want to search for.",
				required: true
			}
		], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
	}
}

module.exports.run = async (client, interaction) => {

	// Get the username from the interaction options
	const userToSearch = interaction.options.getString('username', true);

	// Find the user in the guild
	const member = await findUser(interaction.guild, userToSearch);

	// Create an embed for the response
	const embed = createCustomEmbed({
		title: "Member Search"
	});

	// Initialize an empty array for the members
	let members;
	// Create a dropdown for the user to select a member
	const memberListDropdown = createCustomDropdown({
		customId: "selectMember",
		placeholder: "Select a user to get more info on",
		options: []
	});

	// Create a row for the action buttons
	const row = new ActionRowBuilder();

	// if the member is not found
	if (!member) {

		// update the embed message with an error message
		embed.setDescription(`You searched for \`${userToSearch}\` but I couldn't find any users that match your search query. Click the search button to see users with similar names.`);

		// Update the search button label
		SEARCH.setLabel(`Search users for \`${userToSearch}\``);
		// Add the search button to the row
		row.addComponents(SEARCH);

		// Reply to the interaction with the embed and row
		const memberResponse = await interaction.reply({
			embeds: [embed],
			components: [row],
		}).catch((error) => { return error; });

		// initialize the search command interaction collector
		searchCommandInteractionCollector(memberResponse, embed, row, SEARCH, INFO, memberListDropdown, userToSearch, members);
	} else {
		// If the member is found
		// Update the embed with the member's info
		embed.setDescription(`You searched for \`${userToSearch}\`, and found \`${member.user.username}\` which matches search query. \n\`\`\`\n• ${member.user.username}\`\`\``);
		// Add a footer to the embed
		embed.setFooter({ text: 'Not the user you were looking for? Click the search button to search for users that match your search query.', iconURL: interaction.guild.iconURL({ dynamic: true }) });

		// Update the labels of the search and info buttons
		SEARCH.setLabel(`Search more for \`${userToSearch}\``);
		INFO.setLabel(`Get info for \`${member.user.username}\``);

		// Add the buttons to the row
		row.addComponents(SEARCH, INFO);

		// Reply to the interaction with the embed and row
		const noMemberResponse = await interaction.reply({
			embeds: [embed],
			components: [row]
		}).catch((error) => { return error; });

		// Initialize the search command interaction collector
		searchCommandInteractionCollector(noMemberResponse, embed, row, SEARCH, INFO, memberListDropdown, userToSearch, member, members);
	}
}

/**
 * This function handles the interaction with the user
 * @param {InteractionResponse} commandInteraction - The interaction with the command
 * @param {Embed} embed - The embed to update
 * @param {ActionRowBuilder} row - The row to update
 * @param {ButtonBuilder} searchButton - The search button
 * @param {ButtonBuilder} infoButton - The info button
 * @param {StringSelectMenuBuilder} memberListDropdown - The dropdown with the list of members 
 * @param {string} userToSearch - The member to search for option.
 * @param {GuildMember} member - The member that was found.
 */
const searchCommandInteractionCollector = async (commandInteraction, embed, row, searchButton, infoButton, memberListDropdown, userToSearch, member, members) => {
	// These are the options for the response collector
	const responseCollectorOptions = { componentType: [ComponentType.Button, ComponentType.StringSelect], idle: 300_000, time: 3_600_000 };
	const responseCollector = commandInteraction.createMessageComponentCollector({ responseCollectorOptions });

	// This event is triggered when the user interacts with the bot
	responseCollector.on('collect', async interaction => {
		// If the user clicked the search button
		if (interaction.customId === SEARCH_BUTTON_ID && interaction.isButton()) {
			// Search for users with the specified name
			members = await findUsersFromName(interaction.guild, userToSearch, false);

			// If no users were found
			if (!members || !members.size) {
				// Update the embed with an error message
				embed.setDescription(`I looked up \`${userToSearch}\` but I couldn't find any users that match your search query. Make sure the user exists in the server.`);
				embed.setColor(ERROR);

				// Disable the search button
				await searchButton.setDisabled(true);

				// Update the interaction with the new embed and components
				return await interaction.update({
					embeds: [embed],
					components: [row]
				}).catch((error) => { return error; });
			}

			// If users were found
			// Update the embed with the list of users
			embed.setDescription(`You searched for ${userToSearch} and I've found ${members.size} users who match your search query. \n\`\`\`\n${members.map(m => `• ${m.user.username}`).join('\n')}\`\`\``);
			embed.setColor(BASE_COLOR);

			// Create a dropdown with the list of users
			const memberListDropdownItems = members.map(m => ({
				label: m.user.username,
				description: `Get more info on ${m.user.username}`,
				value: m.user.username
			}));

			// Add the dropdown to the row
			row.components = []
			memberListDropdown.addOptions(memberListDropdownItems);
			row.addComponents(memberListDropdown);

			// Update the interaction with the new embed and components
			return await interaction.update({
				embeds: [embed],
				components: [row]
			}).catch((error) => { return console.error(error); });

		} else if ((interaction.customId === 'selectMember' && interaction.isStringSelectMenu()) || (interaction.customId === INFO_BUTTON_ID && interaction.isButton())) {
			// If the user selected a member from the dropdown or clicked the info button
			// Get the selected member
			const currentMember = interaction.isButton() ? member : members.find(m => m.user.username === interaction.values[0]);

			// Update the embed with the member's info
			embed.data.title = `User Info | ${currentMember.user.username}`;
			embed.data.description = `${currentMember.toString()} - \`${currentMember.user.id}\``;
			embed.data.color = currentMember.displayColor ? currentMember.displayColor : BASE_COLOR;
			embed.data.thumbnail = { url: currentMember.user.displayAvatarURL({ dynamic: true, size: 1024 }) };
			embed.data.fields = [
				{ name: "Joined Discord", value: `\`\`\`${currentMember.user.createdAt.toUTCString()}\`\`\``, inline: true },
				{ name: "Joined Server", value: `\`\`\`${currentMember.joinedAt.toUTCString()}\`\`\``, inline: true },
				{ name: "Roles", value: currentMember.roles.cache.map(r => r.toString()).join(' '), inline: false },
			];
			embed.data.footer = { text: `Requested by ${interaction.user.username}`, icon_url: interaction.user.displayAvatarURL({ dynamic: true }) };
			embed.data.timestamp = new Date();
			embed.data.author = { name: interaction.guild.name, icon_url: interaction.guild.iconURL({ dynamic: true }) };

			// Disable the dropdown
			memberListDropdown.setDisabled(true);

			// Update the interaction with the new embed and components
			return await interaction.update({
				embeds: [embed],
				components: []
			}).catch((error) => { return console.error(error) });
		}
	});

	// This event is triggered when the response collector expires
	responseCollector.on('end', async (interaction) => {
		// Disable the buttons and dropdown
		searchButton.setDisabled(true);
		infoButton.setDisabled(true);
		memberListDropdown.setDisabled(true);

		// Update the interaction with the new components
		return await interaction.update({
			components: [row]
		}).catch((error) => { return console.error(error) });
	});
}