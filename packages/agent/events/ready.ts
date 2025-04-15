// events/ready.ts
import { Events, Client } from 'discord.js';
import { Event } from '../types/event.types';
import { TaskSchedulerTool } from '../tools/task_scheduler.tool';
import { ApiService } from '../services/api';

const event: Event = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        console.log(`✅ Ready! Logged in as ${client.user?.tag}`);
        console.log(`🤖 Serving in ${client.guilds.cache.size} guilds`);
        console.log(`⌛ Started at: ${new Date().toLocaleString()}`);

        client.user?.setPresence({
            activities: [{ name: '🤖', type: 4 }],
            status: 'online'
        });

        // Initialize the API service
        const apiService = new ApiService();

        // Initialize scheduled tasks from database
        try {
            await TaskSchedulerTool.initializeTasks(client, apiService);
            console.log('Scheduled tasks initialized successfully');
        } catch (error) {
            console.error('Error initializing scheduled tasks:', error);
        }
    },
};

export = event;