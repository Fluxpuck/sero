const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { formatNumberWithSuffix, capitalize } = require('../../lib/helpers/StringHelpers/stringHelper');
const RankCardColors = require('../../assets/rankCard');

// Register multiple fonts
const fontsToRegister = [
    { path: './packages/bot/assets/fonts/Roboto-Regular.ttf', family: 'roboto-regular' },
    { path: './packages/bot/assets/fonts/Roboto-Medium.ttf', family: 'roboto-medium' },
    { path: './packages/bot/assets/fonts/Roboto-Black.ttf', family: 'roboto-black' },
    { path: './packages/bot/assets/fonts/Roboto-Bold.ttf', family: 'roboto-bold' },
];

// Loop through the fonts array and register each font
fontsToRegister.forEach(font => {
    registerFont(font.path, { family: font.family });
});

async function createRankCard(
    userId,
    userName,
    avatarURL,
    position,
    experience,
    level,
    nextLevelExp,
    currentLevelExp
) {

    try {

        // Initialize the canvas
        const canvas = createCanvas(400, 100);
        const ctx = canvas.getContext('2d');

        /**
         * AVATAR
         */
        // Load the avatar image
        const avatar = await loadImage(avatarURL);

        // Define dimensions for the avatar
        const avatarWidth = 80;
        const avatarHeight = 80;
        const avatarX = 10;
        const avatarY = 10;

        // Fill background color
        ctx.fillStyle = RankCardColors.BASE;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Create a circular clipping path for the avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(50, 50, 40, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw the avatar image as a circle and position it with a 5-pixel margin on the left side
        ctx.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);

        /**
         * USERNAME
         */
        ctx.restore();
        ctx.fillStyle = RankCardColors.WHITE;
        ctx.font = '24px Roboto Medium';

        // Define the position for the text
        const username_textX = 105;
        const username_textY = 55;

        // Draw the username on the canvas
        // If the username is longer than 140px, we need to truncate it and add ellipsis
        if (ctx.measureText(userName).width > 140) {
            ctx.fillText(userName.substring(0, 10) + '...', username_textX, username_textY);
        } else {
            ctx.fillText(userName, username_textX, username_textY);
        }
        ctx.save();

        /**
         * EXPERIENCE BAR
         */
        ctx.restore();
        ctx.strokeStyle = RankCardColors.BLACK;
        ctx.fillStyle = RankCardColors.YELLOW;

        // Define dimensions for the experience bar
        const barWidth = 280;
        const barHeight = 18;
        const barX = 105;
        const barY = 70;

        // Update the experience bar
        const progressBarWidth = (experience / nextLevelExp) * barWidth;
        ctx.clearRect(barX, barY, barWidth, barHeight);
        ctx.fillRect(barX, barY, progressBarWidth, barHeight);
        ctx.save();

        /**
         * EXPERIENCE TEXT
         */
        ctx.restore();

        // Define the position for the text
        const experience_textX = canvas.width - 14;
        const experience_textY = 55;

        // Draw the text on the canvas
        ctx.font = '14px Roboto medium';
        ctx.textAlign = 'right';
        const experienceText = `${formatNumberWithSuffix(experience)} of ${formatNumberWithSuffix(nextLevelExp)}`;

        const drawExperienceText = (text) => {
            // Split the text into two parts based on separator
            const [currentExp, nextExp] = text.split(' of ');

            // Set color for the first part of the text
            ctx.fillStyle = RankCardColors.YELLOW;
            ctx.fillText(nextExp, experience_textX, experience_textY);

            const nextExpWidth = ctx.measureText(nextExp).width;
            const nextExpX = (experience_textX - nextExpWidth) - 6;

            // Draw the divider
            ctx.fillStyle = `rgba(${RankCardColors.WHITE_RGB}, 0.5)`
            ctx.fillText('of', nextExpX, experience_textY);

            const currentExpOffset = (nextExpX - ctx.measureText('of').width) - 6;

            // Set color for the second part of the text
            ctx.fillStyle = RankCardColors.WHITE;
            ctx.fillText(currentExp, currentExpOffset, experience_textY);
        }


        drawExperienceText(experienceText);
        ctx.save();

        /**
         * RANK && LEVEL TEXT
         */
        ctx.restore();

        // Define the position for the text
        const level_textX = canvas.width - 12;
        const RL_textY = 30;

        const drawRankText = (text, levelTextWidth) => {
            // Split the text into two parts based on separator
            const [rankSymbol, rankNumber] = text.split('-');

            // Set color for the rankNumer
            ctx.font = '24px Roboto Bold';
            ctx.fillStyle = RankCardColors.YELLOW;

            const offsetFromLevelText = level_textX - levelTextWidth - 30;
            let levelTextOffset = offsetFromLevelText;

            // If the levelTextWidth is greater than 20, we need to adjust the offset
            if (levelTextWidth.toFixed(0) >= 20) {
                levelTextOffset -= (levelTextWidth - 2) * 0.275; // Adjust the offset based on the width of the levelText
            }

            ctx.fillText(rankNumber, levelTextOffset + 4, RL_textY);

            // Set color for the rankNumber first and draw it
            ctx.font = '16px Roboto Medium';
            ctx.fillStyle = RankCardColors.WHITE;

            const rankNumberWidth = ctx.measureText(rankNumber).width;
            const offsetFromRankNumber = levelTextOffset + 4 - ctx.measureText(rankNumber).width - 8;
            let rankNumberOffset = offsetFromRankNumber;

            if (rankNumberWidth.toFixed(0) >= 10 && rankNumberWidth.toFixed(0) < 20) {
                rankNumberOffset -= (rankNumberWidth - 2) * 0.275;
            } else if (rankNumberWidth.toFixed(0) >= 20) {
                rankNumberOffset -= (rankNumberWidth - 4) * 0.5;
            }

            // Draw the text on the canvas
            ctx.fillText(rankSymbol, rankNumberOffset, RL_textY);  
        }

        const drawLevelText = (text) => {
            // Split the text into two parts based on separator
            const [levelText, levelNumber] = text.split('-');

            // We then measure the width of the first part to determine the position for the second part
            const levelNumberWidth = ctx.measureText(levelNumber).width;

            // Set color of the levelNumber first and draw it
            ctx.font = '24px Roboto Bold';
            ctx.fillStyle = RankCardColors.YELLOW;
            ctx.fillText(levelNumber, level_textX, RL_textY);

            // Set color of levelText and draw it
            ctx.font = '16px Roboto Medium';
            ctx.fillStyle = RankCardColors.WHITE;

            const offsetFromLevelNumber = level_textX - levelNumberWidth - 15; // 20 is the space between the level number and the first part

            // Calculate the offset based on the levelNumberWidth
            let offset = offsetFromLevelNumber;

            // If the levelNumberWidth is greater than 10 (i.e. 2 digits), we need to adjust the offset
            if (levelNumberWidth.toFixed(0) >= 10 && levelNumberWidth.toFixed(0) < 20) {

                // Adjust the offset based on the width of the levelNumber
                offset -= (levelNumberWidth - 2) * 0.275;

            } else if (levelNumberWidth.toFixed(0) >= 20) { // If the levelNumberWidth is greater than 20 (i.e. 3 digits), we need to adjust the offset
                
                // Adjust the offset based on the width of the levelNumber
                offset -= (levelNumberWidth - 2) * 0.5; 

            }

            // Draw the text on the canvas
            ctx.fillText(levelText, offset, RL_textY);
        }

        // Define text for the rank and level
        const levelText = `Level-${level}`;
        const rankText = `#-${position}`;

        // Measure the width of the levelText
        const levelTextWidth = ctx.measureText(levelText).width;

        // Draw the text on the canvas
        drawLevelText(levelText);
        drawRankText(rankText, levelTextWidth);

        ctx.save();

        // Translate the image to a Discord Attachment
        const attachment = new AttachmentBuilder(
            canvas.toBuffer('image/png', { compressionLevel: 1, resolution: 1, }),
            {
                name: `${userId}_rank.png`,
                description: `Rank card for ${userName}`,
            }
        );

        // Return the rankCard as an attachment
        return attachment ?? undefined;

    } catch (error) {
        console.log(error)

        return undefined
    }



}

module.exports = { createRankCard };


/*



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

    // Draw the username
    ctx.font = 'semi-bold 32px Arial Unicode MS';
    ctx.fillStyle = RANK_CARD_COLORS.white;

    if (ctx.measureText(member.user.username).width > 300) {
        ctx.fillText(member.user.username.substring(0, 20) + '...', 300, 100);
    } else {
        ctx.fillText(member.user.username, 300, 100);
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

    */