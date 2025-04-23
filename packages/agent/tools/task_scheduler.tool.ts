import { Message, Client } from "discord.js";
import { ApiService, ApiResponse } from "../services/api";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import * as cron from 'node-cron';
import { ClaudeService } from "../services/claude";

type TaskInfo = {
    taskId: string;
    userId: string;
    guildId: string;
    schedule: string; // Cron expression
    task_prompt: string;
    executionCount?: number;
    maxExecutions?: number;
}

type TaskSchedulerInput = {
    taskId?: string;
    userId: string;
    guildId: string;
    schedule?: string;
    task_prompt?: string;
    executionCount?: number;
    maxExecutions?: number;
    action: "create" | "update" | "delete" | "list";
}

export class TaskSchedulerTool extends ClaudeToolType {
    private static scheduledTasks: Map<string, cron.ScheduledTask> = new Map();
    private static taskDetails: Map<string, TaskInfo> = new Map();
    private static claudeService: ClaudeService;

    static getToolContext() {
        return {
            name: "task_scheduler",
            description: "Schedule, update, delete, or list tasks for automated execution",
            input_schema: {
                type: "object" as const,
                properties: {
                    taskId: {
                        type: "string",
                        description: "Task ID (required for update/delete actions)"
                    },
                    userId: {
                        type: "string",
                        description: "User ID who owns the task"
                    },
                    guildId: {
                        type: "string",
                        description: "Guild ID where the task should execute"
                    },
                    schedule: {
                        type: "string",
                        description: "Cron expression for scheduling (e.g., '0 9 * * *' for daily at 9am)"
                    },
                    task_prompt: {
                        type: "string",
                        description: "Prompt describing what Claude should do when executing this task"
                    },
                    executionCount: {
                        type: "number",
                        description: "Current execution count (system managed)"
                    },
                    maxExecutions: {
                        type: "number",
                        description: "Maximum number of executions before task is auto-deleted"
                    },
                    action: {
                        type: "string",
                        enum: ["create", "update", "delete", "list"],
                        description: "Action to perform on the task"
                    }
                },
                required: ["action", "userId", "guildId"]
            }
        };
    }

    constructor(
        private readonly client: Client,
        private readonly message: Message,
        private readonly apiService: ApiService = new ApiService(),
    ) {
        super(TaskSchedulerTool.getToolContext());
        if (!TaskSchedulerTool.claudeService) {
            TaskSchedulerTool.claudeService = new ClaudeService();
        }
    }

    /**
     * Initialize tasks from database for all guilds on bot startup
     */
    public static async initializeTasks(client: Client, apiService: ApiService): Promise<void> {
        try {
            // Set the static Claude service
            this.claudeService = new ClaudeService();

            // Get all guilds the bot is in
            const guilds = client.guilds.cache;
            console.log(`Initializing tasks for ${guilds.size} guilds...`);

            for (const [guildId, guild] of guilds) {
                try {
                    const response = await apiService.get(`/guilds/${guildId}/tasks`) as ApiResponse;

                    if (response.status === 200 && response.data) {
                        const tasks = Array.isArray(response.data) ? response.data :
                            (response.data.tasks ? response.data.tasks : []);

                        console.log(`Found ${tasks.length} tasks for guild ${guild.name}`);

                        for (const task of tasks) {
                            await this.scheduleTask(task, client, apiService);
                        }
                    }
                } catch (error) {
                    console.error(`Error loading tasks for guild ${guildId}:`, error);
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
        client: Client,
        apiService: ApiService
    ): Promise<void> {
        if (!taskInfo.taskId || !taskInfo.schedule || !taskInfo.task_prompt) {
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

        // Schedule the task
        const scheduledTask = cron.schedule(taskInfo.schedule, async () => {
            try {
                // Get the guild for this task
                const guild = client.guilds.cache.get(taskInfo.guildId);
                if (!guild) {
                    console.error(`Guild ${taskInfo.guildId} not found for task ${taskInfo.taskId}`);
                    return;
                }

                // Find a text channel to execute in
                const channel = guild.channels.cache.find(c => c.isTextBased());
                if (!channel || !channel.isTextBased()) {
                    console.error(`No text channel found in guild ${taskInfo.guildId} for task ${taskInfo.taskId}`);
                    return;
                }

                // Create a message-like object for Claude execution
                const mockMessage = {
                    guild: guild,
                    channel: channel,
                    author: { id: taskInfo.userId },
                    client: client
                } as any;

                // Execute the task by sending the prompt to Claude
                await this.claudeService.askClaude(
                    taskInfo.task_prompt,
                    mockMessage,
                    { reasoning: false, finalResponse: false }
                );

                // Increment execution count
                taskInfo.executionCount = (taskInfo.executionCount || 0) + 1;

                // Update in database
                await apiService.put(`/guilds/${taskInfo.guildId}/tasks/${taskInfo.taskId}`, {
                    executionCount: taskInfo.executionCount
                });

                // Store updated task info
                this.taskDetails.set(taskInfo.taskId, taskInfo);

                // Check if max executions reached
                if (taskInfo.maxExecutions && taskInfo.executionCount >= taskInfo.maxExecutions) {
                    console.log(`Task ${taskInfo.taskId} reached max executions. Cleaning up.`);

                    // Stop the scheduled task
                    scheduledTask.stop();
                    this.scheduledTasks.delete(taskInfo.taskId);
                    this.taskDetails.delete(taskInfo.taskId);

                    // Delete from database
                    await apiService.delete(`/guilds/${taskInfo.guildId}/tasks/${taskInfo.taskId}`);
                }
            } catch (error) {
                console.error(`Error executing task ${taskInfo.taskId}:`, error);
            }
        }, {
            scheduled: false // Don't start immediately
        });

        // Start the task
        scheduledTask.start();

        // Store the scheduled task
        this.scheduledTasks.set(taskInfo.taskId, scheduledTask);
    }

    /**
     * Create a new task
     */
    private async createTask(input: TaskSchedulerInput): Promise<string> {
        if (!input.schedule || !input.task_prompt) {
            return "Schedule and task_prompt are required for creating a task";
        }

        try {
            // Prepare task data
            const taskData: TaskInfo = {
                taskId: this.message.id,
                userId: input.userId,
                guildId: input.guildId,
                schedule: input.schedule,
                task_prompt: input.task_prompt,
                executionCount: 0,
                maxExecutions: input.maxExecutions
            };

            // Store task in database
            await this.apiService.post(`/guilds/${input.guildId}/tasks`, taskData);

            // Schedule the task
            await TaskSchedulerTool.scheduleTask(taskData, this.client, this.apiService);

            return `Task scheduled successfully with ID: ${this.message.id}`;
        } catch (error) {
            console.error('Error creating task:', error);
            return `Error creating task: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * Update an existing task
     */
    private async updateTask(input: TaskSchedulerInput): Promise<string> {
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
            const taskData: TaskInfo = {
                taskId: input.taskId,
                userId: input.userId || existingTask.userId,
                guildId: input.guildId || existingTask.guildId,
                schedule: input.schedule || existingTask.schedule,
                task_prompt: input.task_prompt || existingTask.task_prompt,
                executionCount: input.executionCount ?? existingTask.executionCount,
                maxExecutions: input.maxExecutions ?? existingTask.maxExecutions
            };

            // Update in database
            await this.apiService.put(`/guilds/${taskData.guildId}/tasks/${input.taskId}`, taskData);

            // Re-schedule the task with new parameters
            await TaskSchedulerTool.scheduleTask(taskData, this.client, this.apiService);

            return `Task ${input.taskId} updated successfully`;
        } catch (error) {
            console.error('Error updating task:', error);
            return `Error updating task: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * Delete a task
     */
    private async deleteTask(input: TaskSchedulerInput): Promise<string> {
        if (!input.taskId) {
            return "Task ID is required for deletion";
        }

        try {
            // Stop the scheduled task
            if (TaskSchedulerTool.scheduledTasks.has(input.taskId)) {
                TaskSchedulerTool.scheduledTasks.get(input.taskId)?.stop();
                TaskSchedulerTool.scheduledTasks.delete(input.taskId);
                TaskSchedulerTool.taskDetails.delete(input.taskId);
            }

            // Delete from database
            await this.apiService.delete(`/guilds/${input.guildId}/tasks/${input.taskId}`);

            return `Task ${input.taskId} deleted successfully`;
        } catch (error) {
            console.error('Error deleting task:', error);
            return `Error deleting task: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * List all tasks for a guild
     */
    private async listTasks(input: TaskSchedulerInput): Promise<string> {
        try {
            const response = await this.apiService.get(`/guilds/${input.guildId}/tasks`) as ApiResponse;

            if (response.status === 200 && response.data) {
                const tasks = Array.isArray(response.data) ? response.data :
                    (response.data.tasks ? response.data.tasks : []);

                if (tasks.length === 0) {
                    return "No scheduled tasks found";
                }

                const tasksList = tasks.map((task: TaskInfo) => {
                    return `- ID: ${task.taskId}\n  Schedule: ${task.schedule}\n  Executions: ${task.executionCount || 0}${task.maxExecutions ? `/${task.maxExecutions}` : ''}\n  Task: ${task.task_prompt?.substring(0, 50)}${task.task_prompt && task.task_prompt.length > 50 ? '...' : ''}`;
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
            switch (input.action) {
                case "create":
                    return await this.createTask(input);

                case "update":
                    return await this.updateTask(input);

                case "delete":
                    return await this.deleteTask(input);

                case "list":
                    return await this.listTasks(input);

                default:
                    return `Unknown action: ${input.action}`;
            }
        } catch (error) {
            console.error(`Error executing TaskScheduler:`, error);
            throw new Error(`Failed to execute ${input.action}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

export const TaskSchedulerToolContext = [
    TaskSchedulerTool.getToolContext()
] as ClaudeTool[];