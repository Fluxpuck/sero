import { Message, GuildMember } from "discord.js";
import { findUser } from "../utils/user-resolver";

import ApiService, { ApiResponse } from "../services/api";

type SeroActionType = "give-exp" | "remove-exp" | "transfer-exp";
type SeroActionTool = {
    fromUser: string
    toUser: string
    actions: SeroActionType[],
    amount?: number
};

export async function SeroUtilities(message: Message, input: SeroActionTool): Promise<string> {

    // Step 1: Find the user
    const fromUser = await findUser(message.guild!, input.fromUser) as GuildMember;
    const toUser = await findUser(message.guild!, input.toUser) as GuildMember;

    // Step 2: Perform moderation actions
    const result: any = [];

    try {
        await Promise.all(input.actions.map(async (action) => {
            switch (action) {

                // Add experience points to a user
                case "give-exp":
                    if (input.toUser && input.amount) {
                        if (!toUser) {
                            throw new Error("User not found");
                        }

                        const response = await ApiService.post(`/guilds/${toUser.guild.id}/levels/exp/${toUser.id}`, { experience: input.amount }) as ApiResponse;
                        if (response.status !== 200) {
                            throw new Error(`Failed to give experience points to ${toUser.user.tag}`);
                        } else {
                            result.push(`Gave ${input.amount} experience points to ${toUser.user.tag}`);
                        }
                    } else {
                        throw new Error("toUser and Amount required for give-exp action");
                    }
                    break;

                // Remove experience points from a user
                case "remove-exp":
                    if (input.fromUser && input.amount) {
                        if (!fromUser) {
                            throw new Error("User not found");
                        }

                        const response = await ApiService.post(`/guilds/${fromUser.guild.id}/levels/exp/${fromUser.id}`, { experience: -input.amount }) as ApiResponse;
                        if (response.status !== 200) {
                            throw new Error(`Failed to remove experience points to ${fromUser.user.tag}`);
                        } else {
                            result.push(`Removed ${input.amount} experience points from ${fromUser.user.tag}`);
                        }
                    } else {
                        throw new Error("fromUser and Amount required for remove-exp action");
                    }
                    break;

                // Transfer experience points from one user to another
                case "transfer-exp":
                    if (input.fromUser && input.toUser && input.amount) {
                        if (!fromUser || !toUser || fromUser.id === toUser.id) {
                            throw new Error("fromUser, toUser or both not found or are the same user");
                        }

                        const transferAmount = Math.min(input.amount, 1_000); // Limit transfer amount to 1,000

                        // Remove from and add to user
                        const [removeResponse, addResponse] = await Promise.all([
                            ApiService.post(`/guilds/${fromUser.guild.id}/levels/exp/${fromUser.id}`, { experience: -transferAmount }),
                            ApiService.post(`/guilds/${toUser.guild.id}/levels/exp/${toUser.id}`, { experience: +transferAmount })
                        ]) as [ApiResponse, ApiResponse];

                        if (removeResponse.status !== 200 || addResponse.status !== 200) {
                            throw new Error('Failed to transfer experience points');
                        }

                        result.push(`Transferred ${transferAmount} experience points from ${fromUser.user.tag} to ${toUser.user.tag}`);
                    } else {
                        throw new Error("fromUser, toUser and Amount required for transfer-exp action");
                    }
                    break;

            }
        }));

        return `
            User Information: ${fromUser ? `fromUser: ${JSON.stringify(fromUser.toJSON())}` : ''}${fromUser && toUser ? ', ' : ''}${toUser ? `toUser: ${JSON.stringify(toUser.toJSON())}` : ''}
            Actions Performed: ${result.join("; ")}
        `;

    } catch (error: any) {
        console.error(`Error executing sero utility actions:`, error);
        return `
            User Information: ${fromUser ? `fromUser: ${JSON.stringify(fromUser.toJSON())}` : ''}${fromUser && toUser ? ', ' : ''}${toUser ? `toUser: ${JSON.stringify(toUser.toJSON())}` : ''}
            ${result.length > 0 ? `Actions Performed: ${result.join("; ")}` : ""}
            Actions Failed: ${error.message}
        `;
    }
}