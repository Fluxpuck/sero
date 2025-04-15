import { Message, TextChannel, ThreadChannel, Client, GuildMember } from "discord.js";
import { ApiService, ApiResponse } from "../services/api";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import { ChannelResolver } from "../utils/channel-resolver";
import * as cron from 'node-cron';
import { ClaudeService } from "../services/claude";

type TaskSchedulerInput = {
    schedule?: string; // Cron expression (e.g., "*/5 * * * *" for every 5 minutes)
    task?: string;
    taskId?: string;
    maxExecutions?: number;
    executionCount?: number;
    guildId?: string;
    userId?: string;
    channelId?: string;
    startDate?: string;
    endDate?: string;
    operation: "schedule" | "list" | "cancel";
}

type StoredTaskInfo = {
    task: cron.ScheduledTask;
    executionCount: number;
    maxExecutions?: number;
    channel: TextChannel | ThreadChannel;
    taskOwnerId?: string;
    prompt: string;    // Store the prompt to execute
    schedule: string;  // Store original schedule string
}

export class TaskSchedulerTool extends ClaudeToolType {
    private static scheduledTasks: Map<string, StoredTaskInfo> = new Map();
    private readonly claudeService: ClaudeService;

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
                    task: {
                        type: "string",
                        description: "A description of the task to be executed. This should be a task description without the scheduled time.",
                        examples: [
                            "Send a reminder to take a break",
                            "Fetch the latest news and send it to the channel",
                            "Run a daily report at 9 AM",
                            "Send a motivational quote every Monday at 8 AM",
                        ],
                    },
                    taskId: {
                        type: "string",
                        description: "Task ID to cancel (required for cancel operation)"
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
                    }
                },
                required: ["operation"]
            }
        };
    }

    private static initializedGuilds = new Set<string>();

    constructor(
        private readonly client: Client,
        private readonly message: Message,
        private readonly apiService: ApiService = new ApiService(),
    ) {
        super(TaskSchedulerTool.getToolContext());
        this.claudeService = new ClaudeService();
        const guildId = this.message.guild?.id;
        if (guildId && !TaskSchedulerTool.initializedGuilds.has(guildId)) {
            TaskSchedulerTool.initializedGuilds.add(guildId);
            this.initializeTool();
        }
    }

    async initializeTool() {
        const guildId = this.message.guild?.id;
        if (!guildId) {
            console.error('Cannot initialize tasks: No guild context available');
            return;
        }

        console.log(`Initializing tasks for guild: ${guildId}`);

        const existingTasksForGuild = Array.from(TaskSchedulerTool.scheduledTasks.entries())
            .filter(([_, taskInfo]) => taskInfo.channel.guild.id === guildId);

        const response = await this.apiService.get(`/guilds/${guildId}/tasks`) as ApiResponse;
        if (response.status === 200) {

            const tasks = response.data as TaskSchedulerInput[];

            // First, delete tasks that exist locally but not in API response
            for (const [existingTaskId] of existingTasksForGuild) {
                if (!tasks.find(task => task.taskId === existingTaskId)) {
                    TaskSchedulerTool.scheduledTasks.delete(existingTaskId);
                }
            }

            // Then update or add tasks from API
            for (const taskData of tasks) {
                if (!taskData.taskId) continue;

                const existingTask = TaskSchedulerTool.scheduledTasks.get(taskData.taskId);
                if (existingTask) {
                    // Update existing task's execution count
                    existingTask.executionCount = taskData.executionCount || 0;
                } else if (taskData.schedule && taskData.task) {
                    // Create new task only if all required fields are present
                    if (cron.validate(taskData.schedule)) {
                        const channel = taskData.channelId
                            ? await ChannelResolver.resolve(this.message.guild!, taskData.channelId)
                            : this.message.channel;

                        if (channel instanceof TextChannel || channel instanceof ThreadChannel) {
                            const task = this.scheduleTask(taskData, taskData.taskId, channel);
                            await TaskSchedulerTool.saveTask(taskData.taskId, guildId, {
                                task,
                                executionCount: taskData.executionCount || 0,
                                maxExecutions: taskData.maxExecutions,
                                channel,
                                taskOwnerId: taskData.userId,
                                prompt: taskData.task,
                                schedule: taskData.schedule
                            });
                        }
                    }
                }
            }
        }
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
                    .map(([taskId, taskInfo]) => ({
                        taskId,
                        task: taskInfo ?? null
                    }));

                return tasks.length > 0
                    ? `Scheduled tasks: ${tasks.map(task => `Task ID: ${task.taskId}, Schedule: ${task.task.schedule}`).join("\n")}`
                    : "No scheduled tasks found.";
            }

            if (input.operation === "cancel") {
                if (!input.taskId) {
                    throw new Error("Task ID is required for cancel operation");
                }
                const success = await TaskSchedulerTool.stopTask(input.taskId);
                return success
                    ? `Task ${input.taskId} canceled successfully.`
                    : `Task ${input.taskId} not found.`;
            }

            if (input.operation === "schedule") {
                if (!input.schedule || !input.task) {
                    throw new Error("Schedule and prompt are required for schedule operation");
                }

                const taskId = `${this.message.id}`;

                const channel = input.channelId
                    ? await ChannelResolver.resolve(this.message.guild, input.channelId)
                    : this.message.channel;
                if (!(channel instanceof TextChannel) && !(channel instanceof ThreadChannel)) {
                    throw new Error("Channel must be a TextChannel or ThreadChannel");
                }

                const task = this.scheduleTask(input, taskId, channel);

                await TaskSchedulerTool.saveTask(taskId, this.message.guild!.id, {
                    task,
                    executionCount: 0,
                    maxExecutions: input.maxExecutions,
                    channel,
                    taskOwnerId: this.message.author.id,
                    prompt: input.task,
                    schedule: input.schedule
                });

                return `Task scheduled successfully. Task ID: ${taskId}`;
            }

            throw new Error("Invalid operation. Supported operations are 'schedule', 'list', or 'cancel'.");
        } catch (error) {
            throw new Error(`Failed to execute operation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    private scheduleTask(input: TaskSchedulerInput, taskId: string, channel: TextChannel | ThreadChannel): cron.ScheduledTask {
        if (!input.schedule || !input.task) {
            throw new Error("Schedule and prompt are required for schedule operation");
        }

        try {
            // Validate cron expression with detailed error message
            if (!cron.validate(input.schedule)) {
                throw new Error(`Invalid cron schedule expression: "${input.schedule}". Format should be: "* * * * *" (minute hour day-of-month month day-of-week)`);
            }

            // Add execution tracking to prevent duplicate executions
            const executionTracker = new Set<string>();

            const task = cron.schedule(input.schedule, async () => {
                const taskInfo = TaskSchedulerTool.scheduledTasks.get(taskId);
                if (!taskInfo) {
                    task.stop();
                    return;
                }

                // Create a unique execution ID based on time (to nearest second)
                // This prevents multiple executions within the same second
                const executionTime = Math.floor(Date.now() / 1000);
                const executionId = `${taskId}-${executionTime}`;

                // Skip if this task has already executed in this second
                if (executionTracker.has(executionId)) {
                    console.log(`Skipping duplicate execution of task ${taskId} at ${executionTime}`);
                    return;
                }

                // Mark this execution
                executionTracker.add(executionId);

                // Clean up execution tracker (keep only last 5 minutes of execution records)
                const FIVE_MINUTES_IN_SECONDS = 300;
                setTimeout(() => {
                    executionTracker.delete(executionId);
                }, FIVE_MINUTES_IN_SECONDS * 1000);

                try {
                    // Create a message-like object using the channel from the task
                    const messageProxy = {
                        ...this.message,
                        channel: taskInfo.channel,
                        reply: async (content: any) => {
                            return await taskInfo.channel.send(content);
                        }
                    };

                    // Execute the prompt using ClaudeService execute
                    const claudeService = new ClaudeService();
                    await claudeService.execute(taskInfo.prompt, messageProxy as Message);

                    // Update local count only after successful execution
                    const updatedTaskInfo = TaskSchedulerTool.scheduledTasks.get(taskId);
                    if (updatedTaskInfo) {
                        updatedTaskInfo.executionCount++;

                        // Check if max executions reached after increment
                        if (updatedTaskInfo.maxExecutions &&
                            updatedTaskInfo.executionCount >= updatedTaskInfo.maxExecutions) {
                            TaskSchedulerTool.stopTask(taskId);
                            return;
                        } else {
                            const apiService = new ApiService();
                            await apiService.post(`/guilds/${taskInfo.channel.guild.id}/tasks/increment/${taskId}`);
                        }
                    }
                } catch (error) {
                    console.error(`Error executing task ${taskId}:`, error);
                }
            }, {
                scheduled: true,
                timezone: "UTC"
            });

            // Add validation before returning
            if (!task || typeof task.start !== 'function') {
                throw new Error('Failed to create cron task');
            }

            this.handleTaskScheduling(task, input);
            return task;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to schedule task: ${errorMessage}`);
        }
    }

    private handleTaskScheduling(task: cron.ScheduledTask, input: TaskSchedulerInput): void {
        // Validate dates if provided
        if (input.startDate && !this.isValidDate(input.startDate)) {
            throw new Error("Invalid start date format. Please use ISO date string.");
        }
        if (input.endDate && !this.isValidDate(input.endDate)) {
            throw new Error("Invalid end date format. Please use ISO date string.");
        }

        const now = Date.now();
        const MAX_TIMEOUT = 2147483647; // Maximum 32-bit signed integer

        if (input.startDate) {
            const startDate = new Date(input.startDate);
            let delay = startDate.getTime() - now;

            if (delay > 0) {
                task.stop();
                if (delay > MAX_TIMEOUT) {
                    // For large delays, use recursive setTimeout
                    const scheduleStart = () => {
                        if (delay <= MAX_TIMEOUT) {
                            setTimeout(() => task.start(), delay);
                        } else {
                            setTimeout(() => {
                                delay -= MAX_TIMEOUT;
                                scheduleStart();
                            }, MAX_TIMEOUT);
                        }
                    };
                    scheduleStart();
                } else {
                    setTimeout(() => task.start(), delay);
                }
            }
        }

        if (input.endDate) {
            const endDate = new Date(input.endDate);
            let delay = endDate.getTime() - now;

            if (delay <= 0) {
                throw new Error("End date must be in the future");
            }

            if (delay > MAX_TIMEOUT) {
                // For large delays, use recursive setTimeout
                const scheduleEnd = () => {
                    if (delay <= MAX_TIMEOUT) {
                        setTimeout(() => {
                            TaskSchedulerTool.stopTask(input.taskId ?? '');
                        }, delay);
                    } else {
                        setTimeout(() => {
                            delay -= MAX_TIMEOUT;
                            scheduleEnd();
                        }, MAX_TIMEOUT);
                    }
                };
                scheduleEnd();
            } else {
                setTimeout(() => {
                    TaskSchedulerTool.stopTask(input.taskId ?? '');
                }, delay);
            }
        }
    }

    static async saveTask(
        taskId: string,
        guildId: string,
        taskInfo: StoredTaskInfo
    ) {
        TaskSchedulerTool.scheduledTasks.set(taskId, taskInfo);

        const apiService = new ApiService();
        const response = await apiService.post(`/guilds/${guildId}/tasks`, {
            taskId,
            guildId: guildId,
            userId: taskInfo.taskOwnerId,
            channelId: taskInfo.channel.id,
            schedule: taskInfo.schedule,
            prompt: taskInfo.prompt,
            maxExecutions: taskInfo.maxExecutions,
            executionCount: taskInfo.executionCount,
            status: 'active'
        }) as ApiResponse;

        if (response.status !== 200 && response.status !== 201) {
            throw new Error(`Failed to save task: ${response.data}`);
        }

        return response.data;
    }

    static startTask(taskId: string): boolean {
        const taskInfo = TaskSchedulerTool.scheduledTasks.get(taskId);
        if (taskInfo) {
            try {
                // Start the cron task
                taskInfo.task.start();

                return true;
            } catch (error) {
                console.error(`Error starting task ${taskId}: ${error instanceof Error ? error.message : String(error)}`);
                return false;
            }
        }
        return false;
    }

    static async stopTask(taskId: string): Promise<boolean> {
        if (!taskId) return false;

        const taskInfo = TaskSchedulerTool.scheduledTasks.get(taskId);
        if (taskInfo) {
            try {
                // Stop the cron task
                taskInfo.task.stop();

                // Delete from memory
                TaskSchedulerTool.scheduledTasks.delete(taskId);

                // Delete from API
                const apiService = new ApiService();
                const response = await apiService.delete(`/guilds/${taskInfo.channel.guild.id}/tasks/${taskId}`) as ApiResponse;
                if (response.status !== 200) {
                    console.error(`Failed to delete task ${taskId} from API: ${response.data}`);
                }

                return true;
            } catch (error) {
                console.error(`Error stopping task ${taskId}: ${error instanceof Error ? error.message : String(error)}`);
                return false;
            }
        }
        return false;
    }
}

export const TaskSchedulerToolContext = [
    TaskSchedulerTool.getToolContext()
] as ClaudeTool[];