import { Message, TextChannel, ThreadChannel, Client } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { ChannelResolver } from "../utils/channel-resolver";

import * as cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';

type TaskSchedulerInput = {
    schedule: string; // Cron expression (e.g., "*/5 * * * *" for every 5 minutes)
    tool: string; // Name of the tool to execute
    toolInput: Record<string, any>; // Input parameters for the tool
    maxExecutions?: number; // Maximum number of times to execute (optional)
    channelId?: string; // Channel to send responses to (optional)
    startDate?: string; // When to start the task (optional)
    endDate?: string; // When to end the task (optional)
}

export class TaskSchedulerTool extends ClaudeToolType {
    private static scheduledTasks: Map<string, {
        task: cron.ScheduledTask,
        executionCount: number,
        maxExecutions?: number
    }> = new Map();

    static getToolContext() {
        return {
            name: "task_scheduler",
            description: "Schedule a task to be executed or set a reminder.",
            input_schema: {
                type: "object" as const,
                properties: {
                    schedule: {
                        type: "string",
                        description: "Cron expression for scheduling (e.g., '*/5 * * * *' for every 5 minutes)"
                    },
                    tool: {
                        type: "string",
                        description: "Name of the tool to execute"
                    },
                    toolInput: {
                        type: "object",
                        description: "Input parameters for the tool"
                    },
                    maxExecutions: {
                        type: "number",
                        description: "Maximum number of times to execute the task (optional)"
                    },
                    channelId: {
                        type: "string",
                        description: "Channel ID to send responses to (optional)"
                    },
                    startDate: {
                        type: "string",
                        description: "ISO date string when to start the task (optional)"
                    },
                    endDate: {
                        type: "string",
                        description: "ISO date string when to end the task (optional)"
                    }
                },
                required: ["schedule", "tool", "toolInput"]
            }
        };
    }

    constructor(
        private readonly client: Client,
        private readonly message: Message,
        private readonly tools: Map<string, ClaudeToolType>
    ) {
        super(TaskSchedulerTool.getToolContext());
    }

    async execute(input: TaskSchedulerInput): Promise<string> {
        if (!this.message.guild) {
            return `Error: This command can only be used in a guild.`;
        }

        try {
            if (!cron.validate(input.schedule)) {
                throw new Error("Invalid cron schedule expression");
            }

            // Validate dates if provided
            if (input.startDate && !this.isValidDate(input.startDate)) {
                throw new Error("Invalid start date format. Please use ISO date string.");
            }
            if (input.endDate && !this.isValidDate(input.endDate)) {
                throw new Error("Invalid end date format. Please use ISO date string.");
            }

            // Validate date order
            if (input.startDate && input.endDate) {
                const startDate = new Date(input.startDate);
                const endDate = new Date(input.endDate);
                if (endDate <= startDate) {
                    throw new Error("End date must be after start date");
                }
            }

            const tool = this.tools.get(input.tool);
            if (!tool) {
                throw new Error(`Tool ${input.tool} not found`);
            }

            const taskId = uuidv4(); // Generate a unique task ID

            const channel = input.channelId
                ? await ChannelResolver.resolve(this.message.guild, input.channelId)
                : this.message.channel;
            if (!(channel instanceof TextChannel) && !(channel instanceof ThreadChannel)) {
                throw new Error("Channel must be a TextChannel or ThreadChannel");
            }

            const task = cron.schedule(input.schedule, async () => {
                const taskInfo = TaskSchedulerTool.scheduledTasks.get(taskId);
                if (!taskInfo) return;

                // Check if max executions reached
                if (taskInfo.maxExecutions && taskInfo.executionCount >= taskInfo.maxExecutions) {
                    task.stop();
                    TaskSchedulerTool.scheduledTasks.delete(taskId);
                    if (channel instanceof TextChannel || channel instanceof ThreadChannel) {
                        channel.send(`Task ${taskId} completed ${taskInfo.maxExecutions} executions and has been stopped.`);
                    }
                    return;
                }

                try {
                    const result = await tool.execute(input.toolInput);
                    channel.send(`Task ${taskId} execution result: ${result}`);
                    taskInfo.executionCount++;
                } catch (error) {
                    channel.send(`Error executing task ${taskId}: ${error}`);
                }
            }, {
                scheduled: false,
                timezone: "UTC"
            });

            // Set start date
            if (input.startDate) {
                const startDate = new Date(input.startDate);
                const delay = startDate.getTime() - Date.now();
                if (delay > 0) {
                    setTimeout(() => task.start(), delay);
                } else {
                    task.start();
                }
            } else {
                task.start();
            }

            // Set end date
            if (input.endDate) {
                const endDate = new Date(input.endDate);
                const delay = endDate.getTime() - Date.now();
                if (delay > 0) {
                    setTimeout(() => {
                        task.stop();
                        TaskSchedulerTool.scheduledTasks.delete(taskId);
                        if (channel instanceof TextChannel || channel instanceof ThreadChannel) {
                            channel.send(`Task ${taskId} reached end date and has been stopped.`);
                        }
                    }, delay);
                } else {
                    throw new Error("End date must be in the future");
                }
            }

            TaskSchedulerTool.scheduledTasks.set(taskId, {
                task,
                executionCount: 0,
                maxExecutions: input.maxExecutions
            });

            return `Task scheduled successfully. Task ID: ${taskId}`;
        } catch (error) {
            throw new Error(`Failed to schedule task: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    static stopTask(taskId: string): boolean {
        const taskInfo = TaskSchedulerTool.scheduledTasks.get(taskId);
        if (taskInfo) {
            taskInfo.task.stop();
            TaskSchedulerTool.scheduledTasks.delete(taskId);
            return true;
        }
        return false;
    }
}

export const TaskSchedulerToolContext = [
    TaskSchedulerTool.getToolContext()
] as ClaudeTool[];