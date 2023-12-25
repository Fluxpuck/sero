const { AttachmentBuilder } = require('discord.js');
const { getRequest } = require("../../database/connection");
const { createCanvas, loadImage, registerFont } = require('canvas');

// Register the font
registerFont('./packages/bot/assets/fonts/Arial Unicode MS.ttf', {
	family: 'sans serif'
});

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

const RANK_CARD_COLORS = {
	border: "#F6C020"
}

module.exports.run = async (client, interaction) => {

	// Get the member from the interaction or the member who ran the interaction if no member was mentioned
	const member = interaction.options.get("member") || interaction.member,
		guildId = interaction.guildId;

	console.log(member.id);
	console.log(guildId);
	// Get the user's rank
	const memberRankResponse = await getRequest(`/levels/${guildId}/${member.id}`);

	if (memberRankResponse.status === 404) {
		return interaction.reply({
			content: `**${member.displayName}** is not ranked yet.`
		});
	}

	console.log(memberRankResponse.data[0])

	const currentLevelExp = memberRankResponse.data[0].currentLevelExp,
		nextLevelExp = memberRankResponse.data[0].nextLevelExp,
		currentLevel = memberRankResponse.data[0].level,
		experience = memberRankResponse.data[0].experience,
		remainingExp = memberRankResponse.data[0].remainingExp;

	// Create the canvas
	const canvas = createCanvas(1000, 300),
		ctx = canvas.getContext('2d');

	// Load the background image
	const background = await loadImage('./packages/bot/assets/images/sero_rank_card.png', 'Rank-card.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	// Draw the user's avatar
	const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 1024 }));

	// Draw circle to clip the avatar
	ctx.beginPath();
	ctx.arc(150, 150, 100, 0, Math.PI * 2);
	ctx.lineWidth = 2;
	ctx.strokeStyle = RANK_CARD_COLORS.border;
	ctx.stroke();
	ctx.closePath();

	// Draw the username
	ctx.font = 'semi-bold 32px Arial Unicode MS';
	ctx.fillStyle = '#ffffff';
	ctx.fillText(member.user.username, 300, 100);

	// Draw the level
	ctx.font = 'normal 32px Arial Unicode MS';
	ctx.fillStyle = '#ffffff';
	ctx.fillText(`Level`, canvas.width - 200, 100);

	// Draw the level number
	ctx.font = 'bold 52px Arial Unicode MS';
	ctx.fillStyle = '#ffffff';
	ctx.fillText(currentLevel, (canvas.width - 250) + ctx.measureText('Level').width, 100);

	// Clip the avatar
	ctx.beginPath();
	ctx.arc(150, 150, 100, 0, Math.PI * 2);
	ctx.shadowBlur = 10;
	ctx.shadowColor = "black";
	ctx.stroke();
	ctx.closePath
	ctx.clip();

	// Draw the user's avatar
	ctx.drawImage(avatar, 50, 50, 200, 200);

	// Send the image
	const attachment = new AttachmentBuilder(canvas.toBuffer(), 'rank-card.png');

	interaction.reply({
		files: [attachment]
	});
}