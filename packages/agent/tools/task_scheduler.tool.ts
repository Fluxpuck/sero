import { Message, TextChannel, Client } from "discord.js";
import { ApiService, ApiResponse } from "../services/api";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import * as cron from 'node-cron';
import { ClaudeService } from "../services/claude";

type TaskInfo = {
    taskId: string;
    userId: string;
    schedule: string; // Cron expression (e.g., "*/5 * * * *" for every 5 minutes)
    task?: string;
    maxExecutions?: number;
    executionCount?: number;
    startDate?: string;
    endDate?: string;
}

type TaskSchedulerInput = TaskInfo & {
    operation: "create" | "update" | "delete" | "list";
}

export class TaskSchedulerTool extends ClaudeToolType {
    private static scheduledTasks: Map<string, cron.ScheduledTask> = new Map();
    private static taskDetails: Map<string, TaskInfo> = new Map();
    private readonly claudeService: ClaudeService;

    static getToolContext() {
        return {
            name: "task_scheduler",
            description: "Schedule a task, set a reminder, or cancel existing tasks.",
            input_schema: {
                type: "object" as const,
                properties: {
                    taskId: {
                        type: "string",
                        description: "Task ID to cancel (required for update or cancel operation)"
                    },
                    userId: {
                        type: "string",
                        description: "User ID of the person who scheduled the task"
                    },
                    schedule: {
                        type: "string",
                        description: "Cron expression for scheduling the task (e.g., '*/5 * * * *')"
                    },
                    task: {
                        type: "string",
                        description: "A description of the task to be executed (required for create/update operations)"
                    },
                    maxExecutions: {
                        type: "number",
                        description: "Maximum number of times the task should execute (optional)"
                    },
                    executionCount: {
                        type: "number",
                        description: "Number of times the task has executed (optional)"
                    },
                    startDate: {
                        type: "string",
                        description: "Start date for the task in ISO format (optional)"
                    },
                    endDate: {
                        type: "string",
                        description: "End date for the task in ISO format (optional)"
                    },
                    operation: {
                        type: "string",
                        enum: ["create", "update", "delete", "list"],
                        description: "Operation to perform: create, update, delete, or list"
                    },
                },
                required: ["operation"]
            }
        };
    }

    constructor(
        private readonly client: Client,
        private readonly message: Message,
        private readonly apiService: ApiService = new ApiService(),
    ) {
        super(TaskSchedulerTool.getToolContext());
        this.claudeService = new ClaudeService();
    }

    /**
     * Initialize tasks from database for a specific guild
     */
    public static async initializeTasks(client: Client, apiService: ApiService): Promise<void> {
        try {
            // Get all guilds the bot is in
            const guilds = client.guilds.cache;

            for (const [guildId, guild] of guilds) {
                try {
                    console.log(`Initializing scheduled tasks for guild: ${guild.name} (${guildId})`);
                    const response = await apiService.get(`/guilds/${guildId}/tasks`) as ApiResponse;
                    if (response.status === 200 && response.data) {

                        // Ensure tasks is an array
                        const tasks = Array.isArray(response.data) ? response.data :
                            (response.data.tasks ? response.data.tasks : []);

                        // Schedule each task if there are any
                        if (tasks.length > 0) {
                            for (const task of tasks) {
                                const channel = guild.channels.cache.find(c => c.isTextBased()) as TextChannel;
                                if (!channel) {
                                    console.warn(`No text channel found for guild ${guild.name} to execute tasks`);
                                    continue;
                                }

                                // Create a fake message object to pass to executeTask
                                const fakeMessage = {
                                    guild: guild,
                                    channel: channel,
                                    author: { id: task.userId },
                                    client: client
                                } as unknown as Message;

                                await this.scheduleTask(task, fakeMessage, client, apiService);
                                console.log(`Scheduled task ${task.taskId} for guild ${guild.name}`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error initializing tasks for guild ${guildId}:`, error);
                }
            }
        } catch (error) {
            console.error('Error initializing tasks:', error);
        }
    }

    /**
     * Schedule a task with node-cron
     */
    private static async scheduleTask(
        taskInfo: TaskInfo,
        message: Message,
        client: Client,
        apiService: ApiService
    ): Promise<void> {
        if (!taskInfo.taskId || !taskInfo.schedule || !taskInfo.task) {
            throw new Error('Missing required task information');
        }

        // Validate cron expression
        if (!cron.validate(taskInfo.schedule)) {
            throw new Error('Invalid cron expression');
        }

        // Store task details
        this.taskDetails.set(taskInfo.taskId, taskInfo);

        // Cancel existing task if it exists
        if (this.scheduledTasks.has(taskInfo.taskId)) {
            this.scheduledTasks.get(taskInfo.taskId)?.stop();
            this.scheduledTasks.delete(taskInfo.taskId);
        }

        // Create a new Claude service for the task
        const claudeService = new ClaudeService();

        // Schedule the task with options to prevent immediate execution
        const scheduledTask = cron.schedule(taskInfo.schedule, async () => {
            try {
                // Check if we've hit max executions
                if (taskInfo.maxExecutions && taskInfo.executionCount &&
                    taskInfo.executionCount >= taskInfo.maxExecutions) {

                    // Stop and cleanup the task
                    scheduledTask.stop();
                    this.scheduledTasks.delete(taskInfo.taskId);
                    this.taskDetails.delete(taskInfo.taskId);

                    // Update task status in database
                    if (message.guild?.id) {
                        await apiService.delete(`/guilds/${message.guild.id}/tasks/${taskInfo.taskId}`);
                    }
                    return;
                }

                // Check if task is within date range
                const now = new Date();
                if (taskInfo.startDate && now < new Date(taskInfo.startDate)) {
                    console.log(`Task ${taskInfo.taskId} not started yet.`);
                    return;
                }
                if (taskInfo.endDate && now > new Date(taskInfo.endDate)) {
                    console.log(`Task ${taskInfo.taskId} expired. Stopping.`);
                    scheduledTask.stop();
                    this.scheduledTasks.delete(taskInfo.taskId);

                    // Update task status in database
                    await apiService.delete(`/guilds/${message.guild?.id}/tasks/${taskInfo.taskId}`);
                    return;
                }

                // Execute scheduled task
                await claudeService.execute(taskInfo.task!, message);

                // Increment execution count
                if (message.guild?.id) {
                    await apiService.post(`/guilds/${message.guild.id}/tasks/increment/${taskInfo.taskId}`, {});
                }

                // Update local count
                taskInfo.executionCount = (taskInfo.executionCount || 0) + 1;
                this.taskDetails.set(taskInfo.taskId, taskInfo);

            } catch (error) {
                console.error(`Error executing task ${taskInfo.taskId}:`, error);
            }
        }, {
            scheduled: false // Don't start immediately
        });

        // Start the task after setup to prevent immediate execution
        scheduledTask.start();

        // Store the scheduled task
        this.scheduledTasks.set(taskInfo.taskId, scheduledTask);
    }

    /**
     * Create and store a task
     */
    private async createTask(input: TaskSchedulerInput): Promise<string> {
        if (!this.message.guild) {
            return "Cannot schedule tasks in DMs";
        }

        if (!input.task || !input.schedule) {
            return "Task and schedule are required for scheduling a task";
        }

        try {
            // Generate a unique task ID if not provided
            const taskId = input.taskId || Date.now().toString();

            // Prepare task data
            const taskData = {
                taskId: this.message.id,
                userId: input.userId || this.message.author.id,
                schedule: input.schedule,
                task: input.task,
                maxExecutions: input.maxExecutions,
                executionCount: input.executionCount || 0,
                startDate: input.startDate,
                endDate: input.endDate,
            };

            // Store task in database
            const response = await this.apiService.post(`/guilds/${this.message.guild.id}/tasks`, taskData);

            // Schedule the task
            await TaskSchedulerTool.scheduleTask(taskData, this.message, this.client, this.apiService);

            return `Task scheduled successfully with ID: ${taskId}`;
        } catch (error) {
            console.error('Error creating task:', error);
            return `Error creating task: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * Update an existing task
     */
    private async updateTask(input: TaskSchedulerInput): Promise<string> {
        if (!this.message.guild) {
            return "Cannot update tasks in DMs";
        }

        if (!input.taskId) {
            return "Task ID is required for updating a task";
        }

        try {
            // Check if task exists
            if (!TaskSchedulerTool.taskDetails.has(input.taskId)) {
                return `Task with ID ${input.taskId} not found`;
            }

            // Get existing task
            const existingTask = TaskSchedulerTool.taskDetails.get(input.taskId)!;

            // Update task data
            const taskData = {
                taskId: input.taskId,
                userId: input.userId || existingTask.userId,
                schedule: input.schedule || existingTask.schedule,
                task: input.task || existingTask.task,
                maxExecutions: input.maxExecutions ?? existingTask.maxExecutions,
                executionCount: input.executionCount ?? existingTask.executionCount,
                startDate: input.startDate || existingTask.startDate,
                endDate: input.endDate || existingTask.endDate,
            };

            // Update in database
            const response = await this.apiService.put(`/guilds/${this.message.guild.id}/tasks/${input.taskId}`, taskData);

            // Reschedule the task with new parameters
            await TaskSchedulerTool.scheduleTask(taskData, this.message, this.client, this.apiService);

            return `Task ${input.taskId} updated successfully`;
        } catch (error) {
            console.error('Error updating task:', error);
            return `Error updating task: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * Delete a task
     */
    private async deleteTask(taskId: string): Promise<string> {
        if (!this.message.guild) {
            return "Cannot manage tasks in DMs";
        }

        try {
            // Stop the scheduled task
            if (TaskSchedulerTool.scheduledTasks.has(taskId)) {
                TaskSchedulerTool.scheduledTasks.get(taskId)?.stop();
                TaskSchedulerTool.scheduledTasks.delete(taskId);
                TaskSchedulerTool.taskDetails.delete(taskId);
            }

            // Delete from database
            await this.apiService.delete(`/guilds/${this.message.guild.id}/tasks/${taskId}`);

            return `Task ${taskId} has been cancelled`;
        } catch (error) {
            console.error('Error deleting task:', error);
            return `Error cancelling task: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * List all tasks
     */
    private async listTasks(): Promise<string> {
        if (!this.message.guild) {
            return "Cannot list tasks in DMs";
        }

        try {
            const response = await this.apiService.get(`/guilds/${this.message.guild.id}/tasks`) as ApiResponse;

            if (response.status === 200 && response.data && response.data.length > 0) {
                const tasks = response.data as TaskInfo[];

                const tasksList = tasks.map(task => {
                    return `- Task ID: ${task.taskId}\n  Schedule: ${task.schedule}\n  Executions: ${task.executionCount || 0}${task.maxExecutions ? `/${task.maxExecutions}` : ''}\n  Task: ${task.task?.substring(0, 50)}${task.task && task.task.length > 50 ? '...' : ''}`;
                }).join('\n\n');

                return `**Scheduled Tasks:**\n\n${tasksList}`;
            } else {
                return "No scheduled tasks found";
            }
        } catch (error) {
            console.error('Error listing tasks:', error);
            return `Error listing tasks: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * Execute the tool
     */
    public async execute(input: TaskSchedulerInput): Promise<string> {
        try {
            switch (input.operation) {
                case "create":
                    return await this.createTask(input);

                case "update":
                    if (!input.taskId) {
                        return "TaskId is required for updating a task";
                    }
                    return await this.updateTask(input);

                case "delete":
                    if (!input.taskId) {
                        return "TaskId is required for deletion";
                    }
                    return await this.deleteTask(input.taskId);

                case "list":
                    return await this.listTasks();

                default:
                    return `Unknown operation: ${input.operation}`;
            }
        } catch (error) {
            console.error('Error executing task scheduler tool:', error);
            return `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
    }
}

export const TaskSchedulerToolContext = [
    TaskSchedulerTool.getToolContext()
] as ClaudeTool[];