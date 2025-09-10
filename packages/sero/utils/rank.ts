import { AttachmentBuilder } from "discord.js";
import sharp from "sharp";

/**
 * Color constants used for rank card generation
 */
export const RankCardColors = {
  BASE: "#191825", // Dark Grey
  BLACK: "#010101", // Black
  YELLOW: "#FECA2C", // Yellow
  WHITE: "#FFFFFF", // White
};

/**
 * Creates a rank card image for a user
 * @param userId - The user's Discord ID
 * @param userName - The user's display name
 * @param avatarURL - URL to the user's avatar
 * @param position - The user's position/rank
 * @param experience - The user's total experience points
 * @param level - The user's current level
 * @param currentLevelExp - Experience required for the current level
 * @param nextLevelExp - Experience required for the next level
 * @returns A Discord AttachmentBuilder containing the rank card image
 */
export const createRankCard = async (
  userId: string,
  userName: string,
  avatarURL: string,
  position: number,
  experience: number,
  level: number,
  currentLevelExp: number,
  nextLevelExp: number
): Promise<AttachmentBuilder | undefined> => {
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
    const progressBarWidth = Math.max(
      0,
      Math.min(barWidth, (userProgress / totalExpForNextLevel) * barWidth)
    );

    // Create a base image with background color
    let baseImage = sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: {
          r: parseInt(RankCardColors.BASE.slice(1, 3), 16),
          g: parseInt(RankCardColors.BASE.slice(3, 5), 16),
          b: parseInt(RankCardColors.BASE.slice(5, 7), 16),
          alpha: 255,
        },
      },
    });

    // Download and process avatar
    const avatarBuffer = await downloadImage(avatarURL);
    const circleAvatar = await sharp(avatarBuffer)
      .resize(avatarSize, avatarSize)
      .composite([
        {
          input: Buffer.from(
            `<svg><circle cx="${avatarSize / 2}" cy="${
              avatarSize / 2
            }" r="${avatarRadius}" /></svg>`
          ),
          blend: "dest-in",
        },
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
    const displayName =
      userName.length > 10 ? userName.substring(0, 10) + "..." : userName;

    // Create SVG for all text elements
    const textSvg = `
            <svg width="${width}" height="${height}">
                <!-- Username -->
                <text x="105" y="55" font-family="sans-serif" font-size="24" font-weight="500" fill="${
                  RankCardColors.WHITE
                }">${displayName}</text>
                
                <!-- Experience Text -->
                <text x="${
                  width - 14
                }" y="55" font-family="sans-serif" font-size="14" font-weight="500" text-anchor="end">
                    <tspan fill="${
                      RankCardColors.WHITE
                    }">${formatNumberWithSuffix(experience)}</tspan>
                    <tspan fill="rgba(255, 255, 255, 0.5)"> of </tspan>
                    <tspan fill="${
                      RankCardColors.YELLOW
                    }">${formatNumberWithSuffix(nextLevelExp)}</tspan>
                </text>
                
                <!-- Level Text -->
                <text x="${width - 12}" y="30" text-anchor="end">
                    <tspan font-family="sans-serif" font-size="16" font-weight="500" fill="${
                      RankCardColors.WHITE
                    }">Level</tspan>
                    <tspan font-family="sans-serif" font-size="24" font-weight="700" fill="${
                      RankCardColors.YELLOW
                    }" dx="5">${level}</tspan>
                </text>
                
                <!-- Rank Text -->
                <text x="${width - 120}" y="30">
                    <tspan font-family="sans-serif" font-size="16" font-weight="500" fill="${
                      RankCardColors.WHITE
                    }">#</tspan>
                    <tspan font-family="sans-serif" font-size="24" font-weight="700" fill="${
                      RankCardColors.YELLOW
                    }" dx="5">${position}</tspan>
                </text>
            </svg>
        `;

    // Composite all elements together
    const finalImage = await baseImage
      .composite([
        {
          input: circleAvatar,
          top: 10,
          left: 10,
        },
        {
          input: Buffer.from(progressBarSvg),
          top: barY,
          left: barX,
        },
        {
          input: Buffer.from(textSvg),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    // Create Discord attachment
    const attachment = new AttachmentBuilder(finalImage, {
      name: `${userId}_rank.png`,
      description: `Rank card for ${userName}`,
    });

    return attachment;
  } catch (error) {
    console.error(
      "Error creating rank card:",
      error instanceof Error ? error.message : String(error)
    );
    // Return undefined so the calling function can handle the error appropriately
    return undefined;
  }
};

// Helper function to download an image
/**
 * Downloads an image from a URL and returns it as a Buffer
 * @param url - The URL of the image to download
 * @returns A Buffer containing the image data
 */
export const downloadImage = async (url: string): Promise<Buffer> => {
  try {
    if (!url) {
      throw new Error("Image URL is missing or empty");
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: HTTP ${response.status} - ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("Received empty image data");
    }

    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(
      "Error downloading image:",
      error instanceof Error ? error.message : String(error)
    );
    // Re-throw the error so the calling function can handle it appropriately
    throw error;
  }
};

/**
 * Formats a number with a suffix (K, M, B, T) based on its magnitude
 * @param num - The number to format
 * @returns The formatted number as a string
 */
const formatNumberWithSuffix = (num: number): string => {
  if (isNaN(num)) return num.toString();

  if (num < 10000) {
    return num.toString();
  } else if (num < 1000000) {
    const result = num / 1000;
    return result.toFixed(1) + " K";
  } else if (num < 1000000000) {
    const result = num / 1000000;
    return result.toFixed(2) + " M";
  } else if (num < 1000000000000) {
    const result = num / 1000000000;
    return result.toFixed(2) + " B";
  } else {
    const result = num / 1000000000000;
    return result.toFixed(2) + " T";
  }
};
