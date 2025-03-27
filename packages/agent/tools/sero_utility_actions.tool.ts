import { Message, User, AuditLogEvent } from "discord.js";
import { ClaudeTool } from "../types/tool.types";
import { findUser } from "../utils/user-resolver";

import ApiService, { ApiResponse } from "../services/api";

type SeroUtilityActionType = "away" | "get-boost" | "set-boost" | "give-exp" | "remove-exp" | "give-money" | "remove-money";
type SeroUtilityToolInput = {
    user: string;
    channel: string;
    actions: SeroUtilityActionType[];
    amount?: number;
    time?: number;
    message?: string;
    economy_type?: "bank" | "wallet";
};

export const SeroUtilityToolContext = [
    {
        name: "sero_utility_actions",
        description: "",
        input_schema: {
            type: "object",
            properties: {
                user: {
                    type: "string",
                    description: "Target user to perform actions on, e.g. username or user ID"
                },
                actions: {
                    type: "array",
                    items: {
                        type: "string",
                        description: "Type of sero action to perform",
                        enum: ["away", "get-boost", "set-boost", "give-exp", "remove-exp", "give-money", "remove-money"]
                    },
                    description: "Array of sero actions to perform"
                },
                amount: {
                    type: "number",
                    description: "Amount experience points, money or the modifier of boost depending on the action (optional). The modifier for boost must be a number between 1 and 5."
                },
                time: {
                    type: "number",
                    description: "Time in minutes for away action or time in hours for the boost action (optional)"
                },
                message: {
                    type: "string",
                    description: "Away message (optional)"
                },
                economy_type: {
                    type: "string",
                    enum: ["bank", "wallet"],
                    description: "Economy type to give or remove money from (optional)"
                }
            },
            required: ["user", "actions"]
        }
    },
] as ClaudeTool[];

export async function SeroUtilityTool(message: Message, input: SeroUtilityToolInput): Promise<string> {
    if (!message.guild) return "This command can only be used in a guild.";

    const user = await findUser(message.guild, input.user);
    if (!user) return `Could not find user "${input.user}"`;

    const actionPromises = input.actions.map(async (action) => {
        try {
            switch (action) {

                case "away":
                    const seroAwayResponse = await ApiService.post(`/guilds/${user.guild.id}/away`, { userId: user.id, duration: input.time, message: input.message }) as ApiResponse;

                    if (seroAwayResponse.status === 200 || seroAwayResponse.status === 201) {
                        return `Set ${user.user.tag} as away for ${input.time} minutes`;
                    }

                    break;

                case "set-boost":
                    const seroBoostResponse = await ApiService.post(`/guilds/boost`, { guildId: user.guild.id, modifier: input.amount }) as ApiResponse;

                    if (seroBoostResponse.status === 200 || seroBoostResponse.status === 201) {
                        return `Set the server boost to **${input.amount}X** for **${input.time} hour${input.time === 1 ? "" : "s"}**.`;
                    }

                    break;

                case "get-boost":
                    const getSeroBoostResponse = await ApiService.get(`/guilds/${user.guild.id}`) as ApiResponse;

                    if (getSeroBoostResponse.status === 200) {
                        const { modifier, duration = 0, expireAt } = getSeroBoostResponse.data;
                        const timeLeft = new Intl.RelativeTimeFormat('en', { style: 'narrow' })
                            .format(Math.ceil((new Date(expireAt).getTime() - Date.now()) / (1000 * 60 * 60)), 'hours');

                        return duration === 0
                            ? `Currently boosting the server **${modifier}X**.\n-# There is ${timeLeft} left.`
                            : `Currently boosting the server **${modifier}X** for **${duration} hour${duration === 1 ? "" : "s"}**.\n-# There is ${timeLeft} left.`
                    }

                    break;

                case "give-exp":
                    const seroGiveExpResponse = await ApiService.post(`/guilds/${user.guild.id}/levels/exp/${user.id}`, { experience: input.amount }) as ApiResponse;

                    if (seroGiveExpResponse.status === 200 || seroGiveExpResponse.status === 201) {
                        return `Gave ${input.amount} experience points to ${user.user.tag}`;
                    }

                    break;

                case "remove-exp":
                    const removeExpAmount = input.amount || 0;
                    const seroRemoveExpResponse = await ApiService.post(`/guilds/${user.guild.id}/levels/exp/${user.id}`, { experience: -removeExpAmount }) as ApiResponse;

                    if (seroRemoveExpResponse.status === 200 || seroRemoveExpResponse.status === 201) {
                        return `Removed ${removeExpAmount} experience points from ${user.user.tag}`;
                    }

                    break;

                case "give-money":
                    const seroGiveMoneyResponse = await ApiService.post(`/guilds/${user.guild.id}/economy/${input.economy_type}/${user.id}`, { experience: input.amount }) as ApiResponse;

                    if (seroGiveMoneyResponse.status === 200 || seroGiveMoneyResponse.status === 201) {
                        return `Gave ${input.amount} experience points to ${user.user.tag}'s ${input.economy_type}`;
                    }

                    break;

                case "remove-money":
                    const removeMoneyAmount = input.amount || 0;
                    const seroRemoveMoneyResponse = await ApiService.post(`/guilds/${user.guild.id}/economy/${input.economy_type}/${user.id}`, { experience: -removeMoneyAmount }) as ApiResponse;

                    if (seroRemoveMoneyResponse.status === 200 || seroRemoveMoneyResponse.status === 201) {
                        return `Removed ${removeMoneyAmount} experience points from ${user.user.tag}'s ${input.economy_type}`;
                    }

                    break;

            }
        } catch (error) {
            console.error(error);
            return `Failed to ${action} ${user.user.tag}: ${error}`;
        }
    });

    const results = await Promise.all(actionPromises);
    return results.join("\n");
};
