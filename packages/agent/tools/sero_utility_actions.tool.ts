import { Client, Message } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { UserResolver } from "../utils/user-resolver";
import ApiService, { ApiResponse } from "../services/api";

type SeroUtilityActionType = "away" | "get-boost" | "set-boost" | "give-exp" | "remove-exp" | "give-money" | "remove-money";
type SeroUtilityToolInput = {
    user: string;
    actions: SeroUtilityActionType[];
    amount?: number;
    time?: number;
    message?: string;
    economy_type?: "bank" | "wallet";
};

export class SeroUtilityActionsTool extends ClaudeToolType {
    static getToolContext() {
        return {
            name: "sero_utility_actions",
            description: "Tool for managing Sero bot utility actions like experience, boosts, and economy",
            input_schema: {
                type: "object" as const,
                properties: {
                    user: {
                        type: "string",
                        description: "Target user to perform actions on, e.g. username or user ID"
                    },
                    actions: {
                        type: "array",
                        items: {
                            type: "string",
                            enum: ["away", "get-boost", "set-boost", "give-exp", "remove-exp", "give-money", "remove-money"],
                            description: "Type of sero action to perform"
                        },
                        description: "Array of sero actions to perform: Away (set user as away), Get Boost (get the current server boost), Set Boost (set the server boost), Give Exp (give experience points), Remove Exp (remove experience points), Give Money (give money), Remove Money (remove money)"
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
        };
    }

    constructor(
        private readonly client: Client,
        private readonly message: Message,
    ) {
        super(SeroUtilityActionsTool.getToolContext());
    }

    private validateInput(input: SeroUtilityToolInput): void {
        if (input.amount && ["set-boost"].includes(input.actions[0])) {
            if (input.amount < 1 || input.amount > 5) {
                throw new Error("Boost modifier must be between 1 and 5");
            }
        }

        if (input.economy_type && !["bank", "wallet"].includes(input.economy_type)) {
            throw new Error("Economy type must be either 'bank' or 'wallet'");
        }
    }

    async execute(input: SeroUtilityToolInput): Promise<string> {
        this.validateInput(input);

        if (!this.message.guild) {
            return `Error: This command can only be used in a guild.`;
        }

        if (!this.message.member?.permissions.has('ManageGuild')) {
            return `Error: You do not have permission to use these actions.`;
        }

        const user = await UserResolver.resolve(this.message.guild, input.user);
        if (!user) {
            return `Error: Could not find user "${input.user}"`;
        }

        const actionPromises = input.actions.map(action => this.handleAction(action, user, input));
        const results = await Promise.all(actionPromises);
        return results.filter(result => result).join("\n");
    }

    private async handleAction(action: SeroUtilityActionType, user: any, input: SeroUtilityToolInput): Promise<string> {
        try {
            switch (action) {
                case "away":
                    return await this.handleAway(user, input);

                case "get-boost":
                    return await this.handleGetBoost(user);

                case "set-boost":
                    return await this.handleSetBoost(user, input);

                case "give-exp":
                    return await this.handleGiveExp(user, input);

                case "remove-exp":
                    return await this.handleRemoveExp(user, input);

                case "give-money":
                    return await this.handleGiveMoney(user, input);

                case "remove-money":
                    return await this.handleRemoveMoney(user, input);

                default:
                    return `Unknown action: ${action}`;
            }
        } catch (error) {
            console.error(`Failed to execute ${action} for ${user.user.tag}:`, error);
            return `Failed to ${action} ${user.user.tag}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }

    private async handleAway(user: any, input: SeroUtilityToolInput): Promise<string> {
        const response = await ApiService.post(`/guilds/${user.guild.id}/away`, {
            userId: user.id,
            duration: input.time,
            message: input.message
        }) as ApiResponse;

        if (response.status === 200 || response.status === 201) {
            return `Set ${user.user.tag} as away for ${input.time} minutes`;
        }

        console.error("Failed to set away status:", response);
        throw new Error("Failed to set away status");
    }

    private async handleGetBoost(user: any): Promise<string> {
        const response = await ApiService.get(`/guilds/${user.guild.id}`) as ApiResponse;

        if (response.status === 200) {
            const { modifier, duration = 0, expireAt } = response.data;
            const timeLeft = new Intl.RelativeTimeFormat('en', { style: 'narrow' })
                .format(Math.ceil((new Date(expireAt).getTime() - Date.now()) / (1000 * 60 * 60)), 'hours');

            return duration === 0
                ? `Currently boosting the server **${modifier}X**.\n-# There is ${timeLeft} left.`
                : `Currently boosting the server **${modifier}X** for **${duration} hour${duration === 1 ? "" : "s"}**.\n-# There is ${timeLeft} left.`;
        }

        console.error("Failed to get boost status:", response);
        throw new Error("Failed to get boost status");
    }

    private async handleSetBoost(user: any, input: SeroUtilityToolInput): Promise<string> {
        const response = await ApiService.post(`/guilds/boost`, {
            guildId: user.guild.id,
            modifier: input.amount,
            duration: input.time
        }) as ApiResponse;

        if (response.status === 200 || response.status === 201) {
            return `Set the server boost to **${input.amount}X** for **${input.time} hour${input.time === 1 ? "" : "s"}**.`;
        }

        console.error("Failed to set boost:", response);
        throw new Error("Failed to set boost");
    }

    private async handleGiveExp(user: any, input: SeroUtilityToolInput): Promise<string> {
        const response = await ApiService.post(`/guilds/${user.guild.id}/levels/exp/${user.id}`, {
            experience: input.amount
        }) as ApiResponse;

        if (response.status === 200 || response.status === 201) {
            return `Gave ${input.amount} experience points to ${user.user.tag}`;
        }

        console.error("Failed to give experience points:", response);
        throw new Error("Failed to give experience points");
    }

    private async handleRemoveExp(user: any, input: SeroUtilityToolInput): Promise<string> {
        const removeAmount = input.amount || 0;
        const response = await ApiService.post(`/guilds/${user.guild.id}/levels/exp/${user.id}`, {
            experience: -removeAmount
        }) as ApiResponse;

        if (response.status === 200 || response.status === 201) {
            return `Removed ${removeAmount} experience points from ${user.user.tag}`;
        }

        console.error("Failed to remove experience points:", response);
        throw new Error("Failed to remove experience points");
    }

    private async handleGiveMoney(user: any, input: SeroUtilityToolInput): Promise<string> {
        if (!input.economy_type) throw new Error("Economy type is required for money actions");

        const response = await ApiService.post(`/guilds/${user.guild.id}/economy/${input.economy_type}/${user.id}`, {
            experience: input.amount
        }) as ApiResponse;

        if (response.status === 200 || response.status === 201) {
            return `Gave ${input.amount} money to ${user.user.tag}'s ${input.economy_type}`;
        }

        console.error("Failed to give money:", response);
        throw new Error("Failed to give money");
    }

    private async handleRemoveMoney(user: any, input: SeroUtilityToolInput): Promise<string> {
        if (!input.economy_type) throw new Error("Economy type is required for money actions");

        const removeAmount = input.amount || 0;
        const response = await ApiService.post(`/guilds/${user.guild.id}/economy/${input.economy_type}/${user.id}`, {
            experience: -removeAmount
        }) as ApiResponse;

        if (response.status === 200 || response.status === 201) {
            return `Removed ${removeAmount} money from ${user.user.tag}'s ${input.economy_type}`;
        }

        console.error("Failed to remove money:", response);
        throw new Error("Failed to remove money");
    }
}

export const SeroUtilityToolContext = [
    SeroUtilityActionsTool.getToolContext()
] as ClaudeTool[];
