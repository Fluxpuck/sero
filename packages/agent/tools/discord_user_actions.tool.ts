import { ClaudeTool } from '../types/tool.types'

const userActionsContext = [
    {
        name: "moderateUser",
        description: "Find and moderate a Discord user with various actions",
        input_schema: {
            type: "object",
            properties: {
                user: {
                    type: "string",
                    description: "The username or user ID to find"
                },
                actions: {
                    type: "array",
                    items: {
                        type: "string",
                        enum: ["timeout", "disconnect", "kick", "ban", "warn", "change_nickname"]
                    },
                    description: "Array of moderation actions to perform"
                },
                duration: {
                    type: "number",
                    description: "Duration in minutes for timeout (ignored for other actions)"
                },
                reason: {
                    type: "string",
                    description: "Reason for the moderation actions"
                },
                name: {
                    type: "string",
                    description: "New nickname for the user (ignored for other actions)"
                }
            },
            required: ["user", "actions"]
        }
    },

] as ClaudeTool[]