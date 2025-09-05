const { AttachmentBuilder } = require('discord.js');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { formatNumberWithSuffix } = require('../helpers/StringHelpers/stringHelper');
const RankCardColors = require('../../assets/rankCard');

// Define font paths for later use
const fontPaths = process.env.NODE_ENV === 'production' ?
    {
        'roboto-black': './assets/fonts/Roboto-Black.ttf',
        'roboto-bold': './assets/fonts/Roboto-Bold.ttf',
        'roboto-medium': './assets/fonts/Roboto-Medium.ttf',
        'roboto-regular': './assets/fonts/Roboto-Regular.ttf'
    } :
    {
        'roboto-black': './packages/bot/assets/fonts/Roboto-Black.ttf',
        'roboto-bold': './packages/bot/assets/fonts/Roboto-Bold.ttf',
        'roboto-medium': './packages/bot/assets/fonts/Roboto-Medium.ttf',
        'roboto-regular': './packages/bot/assets/fonts/Roboto-Regular.ttf'
    };

async function createRankCard(
    userId,
    userName,
    avatarURL,
    position,
    experience,
    level,
    currentLevelExp,
    nextLevelExp,
) {
    try {
        // Define dimensions
        const width = 400;
        const height = 100;
        const avatarSize = 80;
        const avatarRadius = 40;
        const barWidth = 280;
        const barHeight = 18;
        const barX = 105;
        const barY = 70;

        // Calculate experience progress
        const totalExpForNextLevel = nextLevelExp - currentLevelExp;
        const userProgress = experience - currentLevelExp;
        const progressBarWidth = Math.max(0, Math.min(barWidth, (userProgress / totalExpForNextLevel) * barWidth));

        // Create a base image with background color
        let baseImage = sharp({
            create: {
                width: width,
                height: height,
                channels: 4,
                background: { r: parseInt(RankCardColors.BASE.slice(1, 3), 16), 
                              g: parseInt(RankCardColors.BASE.slice(3, 5), 16), 
                              b: parseInt(RankCardColors.BASE.slice(5, 7), 16), 
                              alpha: 255 }
            }
        });

        // Download and process avatar
        const avatarBuffer = await downloadImage(avatarURL);
        const circleAvatar = await sharp(avatarBuffer)
            .resize(avatarSize, avatarSize)
            .composite([
                {
                    input: Buffer.from(`<svg><circle cx="${avatarSize/2}" cy="${avatarSize/2}" r="${avatarRadius}" /></svg>`),
                    blend: 'dest-in'
                }
            ])
            .toBuffer();

        // Create SVG for the progress bar
        const progressBarSvg = `
            <svg width="${barWidth}" height="${barHeight}">
                <rect width="${progressBarWidth}" height="${barHeight}" fill="${RankCardColors.YELLOW}" />
            </svg>
        `;

        // Create SVG for the username text
        // Truncate username if too long (approximate calculation)
        const displayName = userName.length > 10 ? userName.substring(0, 10) + '...' : userName;
        
        // Create SVG for all text elements
        const textSvg = `
            <svg width="${width}" height="${height}">
                <!-- Username -->
                <text x="105" y="55" font-family="sans-serif" font-size="24" font-weight="500" fill="${RankCardColors.WHITE}">${displayName}</text>
                
                <!-- Experience Text -->
                <text x="${width - 14}" y="55" font-family="sans-serif" font-size="14" font-weight="500" text-anchor="end">
                    <tspan fill="${RankCardColors.WHITE}">${formatNumberWithSuffix(experience)}</tspan>
                    <tspan fill="rgba(255, 255, 255, 0.5)"> of </tspan>
                    <tspan fill="${RankCardColors.YELLOW}">${formatNumberWithSuffix(nextLevelExp)}</tspan>
                </text>
                
                <!-- Level Text -->
                <text x="${width - 12}" y="30" text-anchor="end">
                    <tspan font-family="sans-serif" font-size="16" font-weight="500" fill="${RankCardColors.WHITE}">Level</tspan>
                    <tspan font-family="sans-serif" font-size="24" font-weight="700" fill="${RankCardColors.YELLOW}" dx="5">${level}</tspan>
                </text>
                
                <!-- Rank Text -->
                <text x="${width - 120}" y="30">
                    <tspan font-family="sans-serif" font-size="16" font-weight="500" fill="${RankCardColors.WHITE}">#</tspan>
                    <tspan font-family="sans-serif" font-size="24" font-weight="700" fill="${RankCardColors.YELLOW}" dx="5">${position}</tspan>
                </text>
            </svg>
        `;

        // Composite all elements together
        const finalImage = await baseImage
            .composite([
                {
                    input: circleAvatar,
                    top: 10,
                    left: 10
                },
                {
                    input: Buffer.from(progressBarSvg),
                    top: barY,
                    left: barX
                },
                {
                    input: Buffer.from(textSvg),
                    top: 0,
                    left: 0
                }
            ])
            .png()
            .toBuffer();

        // Create Discord attachment
        const attachment = new AttachmentBuilder(finalImage, {
            name: `${userId}_rank.png`,
            description: `Rank card for ${userName}`
        });

        return attachment;

    } catch (error) {
        console.error('Error creating rank card:', error);
        return undefined;
    }
}

// Helper function to download an image
async function downloadImage(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error('Error downloading image:', error);
        throw error;
    }
}

module.exports = { createRankCard };