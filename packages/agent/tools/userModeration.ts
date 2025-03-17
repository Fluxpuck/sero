import { Message } from "discord.js";
import { findUser } from "../utils/user-resolver";

type ModerationType =
    "timeout" | "disconnect" | "ban" | "kick" | "warn" | "purge" | "move" | null;
type UserModerationTool = {
    user: string; // User e.g. '1234567890' or 'username'
    actions: ModerationType[]; // Array of moderation actions to perform
    duration?: number; // timeout duration in minutes
    reason?: string;
};

export async function moderateUser(message: Message, input: UserModerationTool): Promise<string> {

    // Step 1: Find the user
    const user = await findUser(message.guild!, input.user);
    if (!user) {
        return "User not found";
    }

    // If no action specified, return user information
    if (!input.actions || input.actions.length === 0) {
        return `User Information: ${JSON.stringify(user.toJSON())}`;
    }

    // Step 2: Perform moderation actions
    const result: any = [];

    console.log("input.actions", input.actions);

    try {
        await Promise.all(input.actions.map(async (action) => {
            switch (action) {

                case "purge":
                    // Not yet implemented
                    break;

                case "warn":
                    // Not yet implemented
                    break;

                case "disconnect":
                    if (user.voice?.channel) {
                        await user.voice.disconnect(`${input.reason ?? ""} - by Moderator: ${message.author.tag}`);
                        result.push(`User ${user.user.tag} has been disconnected from voice channel`);
                    } else {
                        throw new Error(`User ${user.user.tag} is not in a voice channel`);
                    }
                    break;

                case "timeout":
                    if (input.duration && input.reason) {
                        const durationMs = input.duration * 60 * 1000; // Convert seconds to milliseconds
                        await user.timeout(durationMs, `${input.reason} - by Moderator: ${message.author.tag}`);
                        result.push(`User ${user.user.tag} has been timed out for ${input.duration} minutes for: ${input.reason}`);
                    } else {
                        throw new Error("Duration and reason required for timeout action");
                    }
                    break;

                case "kick":
                    if (input.reason) {
                        await user.kick(`${input.reason} - by Moderator: ${message.author.tag}`);
                        result.push(`User ${user.user.tag} has been kicked for: ${input.reason}`);
                    } else {
                        throw new Error("Reason required for kick action");
                    }
                    break;

                case "ban":
                    if (input.reason) {
                        await user.ban({ deleteMessageSeconds: 24 * 60 * 60, reason: `${input.reason} - by Moderator: ${message.author.tag}` });
                        result.push(`User ${user.user.tag} has been kicked for: ${input.reason}`);
                    } else {
                        throw new Error("Reason required for ban action");
                    }
                    break;
            }
        }));

        return `
            User Information: ${JSON.stringify(user.toJSON())}
            Actions Performed: ${result.join("; ")}
        `;

    } catch (error: any) {
        console.error(`Error executing moderation actions:`, error);
        return `
            User Information: ${JSON.stringify(user.toJSON())}
            ${result.length > 0 ? `Actions Performed: ${result.join("; ")}` : ""}
            Actions Failed: ${error.message}
        `;
    }
}
