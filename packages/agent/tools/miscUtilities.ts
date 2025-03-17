import { Message, GuildChannel, TextChannel } from "discord.js";
import { findUser } from "../utils/user-resolver";
import { findChannel } from "../utils/channel-resolver";

type UtilizationType =
    "slowmode" | "move" | "sendChannelMessage";
type GuildUtilizationTool = {
    user: string; // User e.g. '1234567890' or 'username'
    actions: UtilizationType[]; // Array of utilities actions to perform
    channels?: string[]; // Channel e.g. '1234567890' or 'channelname'
    message?: string; // Message to send in channel
    ratelimit?: number; // Ratelimit in seconds
};

export async function miscUtilities(message: Message, input: GuildUtilizationTool): Promise<string> {

    // Step 1: Find the user
    const user = await findUser(message.guild!, input.user);
    if (!user) {
        return "User not found";
    }

    // Step 2: Find the channels
    let channels: GuildChannel[] = [];
    if (input.channels && input.channels.length > 0) {
        channels = await Promise.all(
            input.channels.map(async (channel) => {
                const foundChannel = await findChannel(message.guild!, channel);
                if (!foundChannel) throw new Error(`Channel ${channel} not found`);
                return foundChannel;
            })
        );
    }

    // Step 3: Perform utility actions
    const result: any = [];

    try {
        await Promise.all(input.actions.map(async (action) => {
            switch (action) {

                // Add slowmode to a channel
                case "slowmode":
                    if (input.ratelimit) {
                        if (!channels[0]) throw new Error("Channel not found");
                        if (!(channels[0] instanceof TextChannel)) throw new Error("Channel must be a text channel");
                        await channels[0].setRateLimitPerUser(input.ratelimit);
                        result.push(`Slowmode set to ${input.ratelimit} seconds in ${channels[0].name}`);
                    } else {
                        throw new Error("Ratelimit required for slowmode action");
                    }
                    break;

                // Move users from one voice channel to another
                case "move":
                    if (channels.length === 2) {
                        if (!channels.every(c => c.isVoiceBased())) {
                            throw new Error("Both channels must be voice channels");
                        }
                        if (channels[0].members.size === 0) {
                            throw new Error("Source channel has no members to move");
                        }
                        await user.voice.setChannel(channels[1]);
                        result.push(`Users moved from ${channels[0].name} to ${channels[1].name}`);
                    } else {
                        throw new Error("Two channels required for move action");
                    }
                    break;

                // Send a message to target channel(s)
                case "sendChannelMessage":
                    if (input.message && channels.length >= 1) {
                        for (const channel of channels) {
                            if (channel.isTextBased()) {
                                await (channel as TextChannel).send(input.message);
                                result.push(`Message sent to ${channel.name}`);
                            }
                        }
                    } else {
                        throw new Error("At least one channel required for sendChannelMessage action");
                    }
                    break;
            }
        }));

        return `
            User Information: ${JSON.stringify(user.toJSON())}
            ${input.channels ? `Channel Information: ${channels.join('; ')}` : ""}
            Actions Performed: ${result.join("; ")}
        `;

    } catch (error: any) {
        console.error(`Error executing utility actions:`, error);
        return `
            User Information: ${JSON.stringify(user.toJSON())}
            ${input.channels ? `Channel Information: ${channels.join('; ')}` : ""}
            ${result.length > 0 ? `Actions Performed: ${result.join("; ")}` : ""}
            Actions Failed: ${error.message}
        `;
    }
}

