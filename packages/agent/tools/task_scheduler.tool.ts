import { Message, GuildMember, TextChannel, Client } from "discord.js";
import { ClaudeTool, ClaudeToolType } from "../types/tool.types";
import cron from "node-cron";
import { findUser } from "../utils/user-resolver";
import { findChannel } from "../utils/channel-resolver";
import {
    parseISO,
    isFuture,
    format,
    getMinutes,
    getHours,
    getDate,
    getMonth,
    getDay,
    isToday,
    subMinutes
} from 'date-fns';

type TaskType = "command" | "reminder";
type ScheduleType = "once" | "daily" | "weekly" | "monthly";

type TaskSchedulerInput = {
    task: string;
    task_context?: string;
    task_type: TaskType;
    schedule_type: ScheduleType;
    datetime: string;
    user: string;
    channel?: string;
    isDM: boolean;
}

export class TaskSchedulerTool extends ClaudeToolType {
    private static scheduledTasks: Map<string, cron.ScheduledTask | { stop: () => void }> = new Map();

    static getToolContext() {
        return {
            name: "task_scheduler",
            description: "Schedule a task to be executed or set a reminder.",
            input_schema: {
                type: "object" as const,
                properties: {
                    task: {
                        type: "string",
                        description: "The task or command to be scheduled or message to be reminded"
                    },
                    task_context: {
                        type: "string",
                        description: "Further details about the task or command, e.g. 100 exp points"
                    },
                    task_type: {
                        type: "string",
                        enum: ["command", "reminder"],
                        description: "Type of task (command execution or reminder message)"
                    },
                    schedule_type: {
                        type: "string",
                        enum: ["once", "daily", "weekly", "monthly"],
                        description: "Type of schedule recurrence"
                    },
                    datetime: {
                        type: "string",
                        description: "Date and time for the task (ISO 8601 format, e.g., '2024-03-27T15:00:00Z')"
                    },
                    user: {
                        type: "string",
                        description: "The username, user ID, or @mention to find"
                    },
                    channel: {
                        type: "string",
                        description: "The channel name, ID, or #mention to filter results (optional)"
                    },
                    isDM: {
                        type: "boolean",
                        description: "Indicate if the task is a direct message",
                        default: false
                    }
                },
                required: ["task", "task_type", "schedule_type", "datetime", "user"]
            }
        };
    }

    constructor(
        private readonly client: Client,
        private readonly message: Message,
    ) {
        super(TaskSchedulerTool.getToolContext());
    }

    private validateInput(input: TaskSchedulerInput): void {
        if (!input.task || !input.task_type || !input.schedule_type || !input.datetime || !input.user) {
            throw new Error("Missing required parameters for task scheduling");
        }

        const dateTime = parseISO(input.datetime);
        const scheduledTime = process.env.NODE_ENV === "development" ? subMinutes(dateTime, 60) : dateTime;

        if (isNaN(scheduledTime.getTime())) {
            throw new Error("Invalid datetime format. Use ISO 8601 format (e.g., 2024-03-27T15:00:00Z)");
        }

        if (!isFuture(scheduledTime)) {
            throw new Error("Scheduled time must be in the future");
        }
    }

    private getCronExpression(scheduledTime: Date, scheduleType: ScheduleType): string {
        switch (scheduleType) {
            case "once":
                if (isToday(scheduledTime)) {
                    return `${getMinutes(scheduledTime)} ${getHours(scheduledTime)} * * *`;
                }
                return `${getMinutes(scheduledTime)} ${getHours(scheduledTime)} ${getDate(scheduledTime)} ${getMonth(scheduledTime) + 1} *`;
            case "daily":
                return `${getMinutes(scheduledTime)} ${getHours(scheduledTime)} * * *`;
            case "weekly":
                return `${getMinutes(scheduledTime)} ${getHours(scheduledTime)} * * ${getDay(scheduledTime)}`;
            case "monthly":
                return `${getMinutes(scheduledTime)} ${getHours(scheduledTime)} ${getDate(scheduledTime)} * *`;
            default:
                throw new Error("Invalid schedule type");
        }
    }

    private async executeTask(channel: TextChannel, user: GuildMember, input: TaskSchedulerInput) {
        const message = `Reminder: ${input.task} ${input.task_context ?? ''}`;

        if (input.isDM) {
            try {
                await user.send(message);
            } catch (error) {
                // If DM fails, fall back to channel mention
                await channel.send(`${user}, I couldn't send you a DM. ${message}`);
            }
        } else {
            if (input.task_type === "reminder") {
                await channel.send(`${user}, ${message}`);
            } else if (input.task_type === "command") {
                await channel.send(`${user}, Executing scheduled command: ${input.task}`);
            }
        }
    }

    async execute(input: TaskSchedulerInput): Promise<string> {
        this.validateInput(input);

        if (!this.message.guild) {
            throw new Error("This command can only be used in a guild.");
        }

        const user = await findUser(this.message.guild, input.user);
        if (!user) {
            throw new Error(`Could not find user "${input.user}"`);
        }

        // Only get channel if not DM
        let targetChannel: TextChannel | null = null;
        if (!input.isDM) {
            targetChannel = input.channel
                ? (await findChannel(this.message.guild, input.channel) ?? this.message.channel) as TextChannel
                : this.message.channel as TextChannel;
            if (!targetChannel.isTextBased()) {
                throw new Error("The specified channel must be a text channel.");
            }
        } else {
            targetChannel = this.message.channel as TextChannel; // Fallback channel if DM fails
        }

        const dateTime = parseISO(input.datetime);
        const scheduledTime = process.env.NODE_ENV === "development" ? subMinutes(dateTime, 60) : dateTime;
        const delay = scheduledTime.getTime() - Date.now();
        const taskId = `${Date.now()}-${user.id}`;

        // Handle short-term scheduling (less than 1 hour)
        if (input.schedule_type === "once" && delay <= 3600000) {
            const timeoutId = setTimeout(async () => {
                await this.executeTask(targetChannel, user, input);
                TaskSchedulerTool.scheduledTasks.delete(taskId);
            }, delay);

            TaskSchedulerTool.scheduledTasks.set(taskId, {
                stop: () => clearTimeout(timeoutId)
            } as any);
        } else {
            // Handle long-term scheduling with cron
            const cronExpression = this.getCronExpression(scheduledTime, input.schedule_type);
            const scheduledTask = cron.schedule(cronExpression, async () => {
                await this.executeTask(targetChannel, user, input);
                if (input.schedule_type === "once") {
                    TaskSchedulerTool.cancelTask(taskId);
                }
            });

            TaskSchedulerTool.scheduledTasks.set(taskId, scheduledTask);
        }

        return `Task scheduled successfully:
- ID: ${taskId}
- Type: ${input.task_type}
- Schedule: ${input.schedule_type}
- Time: ${format(scheduledTime, 'PPpp')}
- Target: ${user.user.username}
- Channel: ${targetChannel?.name ?? 'DM'}`;
    }

    static cancelTask(taskId: string): boolean {
        const task = TaskSchedulerTool.scheduledTasks.get(taskId);
        if (task) {
            task.stop();
            TaskSchedulerTool.scheduledTasks.delete(taskId);
            return true;
        }
        return false;
    }
}

export const TaskSchedulerToolContext = [
    TaskSchedulerTool.getToolContext()
] as ClaudeTool[];