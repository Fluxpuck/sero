import { Message, TextChannel, ThreadChannel, Client } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { ChannelResolver } from "../utils/channel-resolver";
import * as cron from 'node-cron';

type TaskSchedulerInput = {
    schedule?: string; // Cron expression (e.g., "*/5 * * * *" for every 5 minutes)
    tool?: string;
    toolInput?: Record<string, any>;
    maxExecutions?: number;
    channelId?: string;
    startDate?: string;
    endDate?: string;
    operation: "schedule" | "list" | "cancel";
    taskId?: string;
}

export class TaskSchedulerTool extends ClaudeToolType {
    private static scheduledTasks: Map<string, {
        task: cron.ScheduledTask,
        executionCount: number,
        maxExecutions?: number,
        channel: TextChannel | ThreadChannel,
        taskOwnerId?: string
    }> = new Map();

    static getToolContext() {
        return {
            name: "task_scheduler",
            description: "Schedule a task to be executed, set a reminder, or cancel existing tasks.",
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
                    },
                    operation: {
                        type: "string",
                        description: "Operation to perform: 'schedule', 'list', or 'cancel'",
                        enum: ["schedule", "list", "cancel"]
                    },
                    taskId: {
                        type: "string",
                        description: "Task ID to cancel (required for cancel operation)"
                    }
                },
                required: ["operation"]
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
            if (input.operation === "list") {
                if (!this.message.member) {
                    return "Error: Could not determine the member requesting the list.";
                }

                const tasks = Array.from(TaskSchedulerTool.scheduledTasks.entries())
                    .filter(([_, taskInfo]) => taskInfo.taskOwnerId === this.message.author.id)
                    .map(([taskId, taskInfo]) => `Task ID: ${taskId}, Channel: ${taskInfo.channel.name}`)
                    .join("\n");
                return tasks.length > 0 ? tasks : "You have no scheduled tasks.";
            }

            if (input.operation === "cancel") {
                if (!input.taskId) {
                    throw new Error("Task ID is required for cancel operation");
                }
                const success = TaskSchedulerTool.stopTask(input.taskId);
                return success
                    ? `Task ${input.taskId} canceled successfully.`
                    : `Task ${input.taskId} not found.`;
            }

            if (input.operation === "schedule") {
                if (!input.schedule || !input.tool || !input.toolInput) {
                    throw new Error("Schedule, tool, and toolInput are required for schedule operation");
                }

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

                const taskId = `${this.message.id}`

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
                        taskInfo.channel.send(`Task ${taskId} completed ${taskInfo.maxExecutions} executions and has been stopped.`);
                        return;
                    }

                    try {
                        const result = await tool.execute(input.toolInput);
                        taskInfo.channel.send(`Task ${taskId} execution result: ${result}`);
                        taskInfo.executionCount++;
                    } catch (error) {
                        taskInfo.channel.send(`Error executing task ${taskId}: ${error instanceof Error ? error.message : String(error)}`);
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
                            channel.send(`Task ${taskId} reached end date and has been stopped.`);
                        }, delay);
                    } else {
                        throw new Error("End date must be in the future");
                    }
                }

                TaskSchedulerTool.scheduledTasks.set(taskId, {
                    task,
                    executionCount: 0,
                    maxExecutions: input.maxExecutions,
                    channel,
                    taskOwnerId: this.message.author.id
                });

                return `Task scheduled successfully. Task ID: ${taskId}`;
            }

            throw new Error("Invalid operation. Supported operations are 'schedule' and 'cancel'.");
        } catch (error) {
            throw new Error(`Failed to execute operation: ${error instanceof Error ? error.message : String(error)}`);
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
            taskInfo.channel.send(`Task ${taskId} has been cancelled.`);
            return true;
        }
        return false;
    }
}

export const TaskSchedulerToolContext = [
    TaskSchedulerTool.getToolContext()
] as ClaudeTool[];