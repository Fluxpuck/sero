const { AttachmentBuilder } = require('discord.js');
const { createCustomEmbed } = require('../../assets/embed');
const { getRequest } = require("../../database/connection");
const { createCanvas, loadImage, registerFont } = require('canvas');
const { formatNumberWithSuffix } = require('../../lib/helpers/StringHelpers/stringHelper');
const ClientEmbedColors = require('../../assets/embed-colors');

// Register the font
registerFont('./packages/bot/assets/fonts/Arial Unicode MS.ttf', {
	family: 'sans serif'
});

// Path to the presence icons
const presenceIconsFilePath = './packages/bot/assets/images/icons_png';

/* 
	The colors used in the rank card. Note: These colors are based on the Sero theme. 
	The accent can be changed later to match different backgrounds?
*/
const RANK_CARD_COLORS = {
	main: "#F6C020",
	main_rgb: "246, 192, 32",
	white: "#ffffff",
	white_rgb: "255, 255, 255",
	black: "#000000",
	black_rgb: "0, 0, 0",
}

/*
	Error messages for the rank command.
	@Fluxpuck - I'm not sure if this is the best way to handle error messages, but it's the best I could think of. Maybe we can move this to a separate file?
*/
const ERROR_MESSAGES = {
	USER_NOT_FOUND: "User `{{userName}}` not found.",
	USER_NOT_RANKED: "User {{userName}} is not ranked yet.",
	USER_RANK_ERROR: "An error occurred while getting the {{userName}}'s rank.",
	RANK_CARD_ERROR: "An error occurred while generating the rank card!",
	RANK_CMD_ERROR: "An error occurred while executing the rank command!",
}

module.exports.props = {
	commandName: "rank",
	description: "Get a user's rank if user is mentioned, or get your own rank if no user is mentioned.",
	usage: "/rank [user]",
	interaction: {
		type: 1,
		options: [
			{
				name: "member",
				type: 6,
				description: "The user you want to get the rank of.",
				required: false,
			},
		],
	}
}

module.exports.run = async (client, interaction) => {

	// Get the member from the interaction or the member who ran the interaction if no member was mentioned
	const member = interaction.options.get("member") || interaction.member,
		guildId = interaction.guildId;

	let memberRankResponse;

	// Get the user's rank
	try {
		memberRankResponse = await getRequest(`/levels/${guildId}/${member.user.id}`);
	} catch (error) {
		console.error(error);
		return sendErrorEmbed(interaction, ERROR_MESSAGES.RANK_CMD_ERROR);
	}

	if (memberRankResponse.status === 404) {
		return sendErrorEmbed(interaction, ERROR_MESSAGES.USER_NOT_RANKED.replace('{{userName}}', member.user.toString()));
	}

	if (memberRankResponse.status !== 200) {
		return sendErrorEmbed(interaction, ERROR_MESSAGES.USER_RANK_ERROR.replace('{{user}}', member.user.username));
	}

	const currentLevelExp = memberRankResponse.data[0].currentLevelExp,
		nextLevelExp = memberRankResponse.data[0].nextLevelExp,
		currentLevel = memberRankResponse.data[0].level;

	// Create the canvas
	const canvas = createCanvas(1000, 300),
		  ctx = canvas.getContext('2d');

	// Load the background image
	const background = await loadImageforCanvas('./packages/bot/assets/images/sero_rank_card.png');

	// if loadImageforCanvas returns null, send an error embed and return
	if (!background) {
		return sendErrorEmbed(interaction, ERROR_MESSAGES.RANK_CARD_ERROR);
	}

	// Draw the background image
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	// Load the user's avatar
	const avatar = await loadImageforCanvas(member.user.displayAvatarURL({ extension: 'png', size: 1024 }));

	// if loadImageforCanvas returns null, send an error embed and return
	if (!avatar) {
		return sendErrorEmbed(interaction, ERROR_MESSAGES.RANK_CARD_ERROR);
	}

	// Draw circle to clip the avatar
	ctx.beginPath();
	ctx.arc(150, 150, 100, 0, Math.PI * 2);
	ctx.fillStyle = `rgba(${RANK_CARD_COLORS.black_rgb}, 0.5)`;
	ctx.fill();

	// Add a border to the avatar
	ctx.strokeStyle = RANK_CARD_COLORS.main;
	ctx.lineWidth = 2;
	ctx.stroke();
	ctx.closePath();

	// Clip the avatar
	ctx.save(); // Save the current state
	ctx.beginPath();
	ctx.arc(150, 150, 100, 0, Math.PI * 2);
	ctx.closePath();
	ctx.clip();

	// Draw the user's avatar
	ctx.drawImage(avatar, 50, 50, 200, 200);
	ctx.restore(); // Restore the previous state

	// Draw the user's presence icon
	// Check if member has a presence
	if (member.presence != undefined) {

		// Check if the user is offline
		if (member.presence?.clientStatus === null || Object.keys(member.presence.clientStatus).length === 0 && member.presence.clientStatus.constructor === Object) {
			// If the user is offline, draw the offline icon
			const offlineIcon = await loadImageforCanvas(`${presenceIconsFilePath}offline.png`);

			if (!offlineIcon) {
				return sendErrorEmbed(interaction, ERROR_MESSAGES.RANK_CARD_ERROR);
			}

			ctx.drawImage(offlineIcon, 295, 65, 50, 50);

			// Draw the username
			ctx.font = 'semi-bold 32px Arial Unicode MS';
			ctx.fillStyle = RANK_CARD_COLORS.white;

			// If the username is too long, shorten it and add ellipsis
			if (ctx.measureText(member.user.username).width > 300) {
				ctx.fillText(member.user.username.substring(0, 20) + '...', 350, 100);
			} else {
				ctx.fillText(member.user.username, 350, 100);
			}

		} else {
			// Choose the first status the user has and draw the icon
			const entries = Object.entries(member.presence.clientStatus);
			if (entries.length > 0) {
				const currentMemberPresence = entries[0][0] + entries[0][1];

				const presenceIcon = await loadImageforCanvas(`${presenceIconsFilePath}/${currentMemberPresence}.png`);

				if (!presenceIcon) {
					return sendErrorEmbed(interaction, ERROR_MESSAGES.RANK_CARD_ERROR);
				}

				ctx.drawImage(presenceIcon, 295, 65, 50, 50);

				// Draw the username
				ctx.font = 'semi-bold 32px Arial Unicode MS';
				ctx.fillStyle = RANK_CARD_COLORS.white;

				// If the username is too long, shorten it and add ellipsis
				if (ctx.measureText(member.user.username).width > 300) {
					ctx.fillText(member.user.username.substring(0, 20) + '...', 350, 100);
				} else {
					ctx.fillText(member.user.username, 350, 100);
				}
			}
		}
	} else { // Post the username if the user has no presence
		// Draw the username
		ctx.font = 'semi-bold 32px Arial Unicode MS';
		ctx.fillStyle = RANK_CARD_COLORS.white;

		// If the username is too long, shorten it and add ellipsis
		if (ctx.measureText(member.user.username).width > 300) {
			ctx.fillText(member.user.username.substring(0, 20) + '...', 300, 100);
		} else {
			ctx.fillText(member.user.username, 300, 100);
		}
	}

	// Filling the level details
	// Draw the level
	ctx.font = 'normal 32px Arial Unicode MS';
	ctx.fillStyle = RANK_CARD_COLORS.white;
	ctx.fillText(`Level`, canvas.width - 210, 100);

	// Draw the level number
	ctx.font = 'bold 52px Arial Unicode MS';
	ctx.fillStyle = RANK_CARD_COLORS.white;
	ctx.fillText(currentLevel, (canvas.width - 260) + ctx.measureText('Level').width, 100);

	// Draw the experience bar
	ctx.lineJoin = 'round';
	ctx.lineWidth = 40;

	// Shadow of the xp bar
	ctx.strokeStyle = `rgba(${RANK_CARD_COLORS.black_rgb}, 0.8)`;
	ctx.strokeRect(319, canvas.height - 151, 602, 2);

	// Empty bar
	ctx.strokeStyle = `rgba(${RANK_CARD_COLORS.main_rgb}, 0.2)`;
	ctx.strokeRect(320, canvas.height - 150, 600, 0);

	// Filled bar
	ctx.strokeStyle = `rgba(${RANK_CARD_COLORS.main_rgb}, 1)`;
	ctx.strokeRect(320, canvas.height - 150, (600 * (currentLevelExp / nextLevelExp)), 0);

	// Draw the experience
	ctx.font = 'normal 32px Arial Unicode MS';
	ctx.fillStyle = RANK_CARD_COLORS.white;
	let currentExpText = `${formatNumberWithSuffix(currentLevelExp)}`;
	ctx.fillText(`${currentExpText}`, canvas.width - 250, canvas.height - 80);


	// Draw the experience number
	ctx.font = 'bold 32px Arial Unicode MS';
	ctx.fillStyle = RANK_CARD_COLORS.white;
	let nextExpText = `${formatNumberWithSuffix(nextLevelExp)}`;
	ctx.fillText('/ ' + nextExpText, (canvas.width - 250) + ctx.measureText(currentExpText).width, canvas.height - 80);

	// Send the image
	const attachment = new AttachmentBuilder(
		canvas.toBuffer('image/png', { compressionLevel: 1, resolution: 1, }),
		{
			name: `${member.user.id}_rank.png`,
			description: `Rank card for ${member.user.username}`,
		}
	);

	interaction.reply({
		files: [attachment]
	});
}

/*
	Loads an image for the canvas. Returns null if the image could not be loaded.
*/
const loadImageforCanvas = async (img) => {
	try {
		const image = await loadImage(img);
		return image;
	} catch (error) {
		console.error(error);
		return null;
	}
}

/*
	Sends an error embed to the user.
	@Fluxpuck - Suggestions on where we can move this function?
*/
const sendErrorEmbed = async (interaction, error) => {
	const errorEmbed = createCustomEmbed({
		color: ClientEmbedColors.ERROR,
		title: '<:red_cross:662323115917049876> | Uh oh!',
		description: error
	});

	await interaction.reply({
		embeds: [errorEmbed],
	});
}