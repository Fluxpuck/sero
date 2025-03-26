import { Message, User, AuditLogEvent } from "discord.js";
import { ClaudeTool } from "../types/tool.types";
import { findUser } from "../utils/user-resolver";

import ApiService, { ApiResponse } from "../services/api";

type SeroUtilityActionType = "away" | "boost" | "give-exp" | "remove-exp" | "give-money" | "remove-money";
type SeroUtilityToolInput = {
    user: string;
    channel: string;
    actions: SeroUtilityActionType[];
    amount?: number;
    time?: number;
    message?: string;
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
                        enum: ["away", "boost", "give-exp", "remove-exp", "give-money", "remove-money"]
                    },
                    description: "Array of sero actions to perform"
                },
                amount: {
                    type: "number",
                    description: "Amount of time, exp or money depending on the action (optional)"
                },
                time: {
                    type: "number",
                    description: "Time in minutes for away action or time in hours for the boost action (optional)"
                },
                message: {
                    type: "string",
                    description: "Away message (optional)"
                },
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
                    return `Away action not implemented`;

                case "boost":
                    return `Boost action not implemented`;

                case "give-exp":
                    return `Give exp action not implemented`;

                case "remove-exp":
                    return `Remove exp action not implemented`;

                case "give-money":
                    return `Give money action not implemented`;

                case "remove-money":
                    return `Remove money action not implemented`;

            }
        } catch (error) {
            console.error(error);
            return `Failed to ${action} ${user.user.tag}: ${error}`;
        }
    });

    const results = await Promise.all(actionPromises);
    return results.join("\n");
};
