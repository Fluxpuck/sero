// index.ts - Main bot file
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Command } from './types/command.types';
import { Event } from './types/event.types';

dotenv.config({ path: path.join(__dirname, '.', 'config', '.env') });

// Create client instance with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// Extend the Client interface to include commands
declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, Command>;
    }
}

// Initialize commands collection
client.commands = new Collection<string, Command>();

// Load events
const loadEvents = (): void => {
    const eventsPath: string = path.join(__dirname, 'events');
    const eventFiles: string[] = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath: string = path.join(eventsPath, file);
        const event: Event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }

        console.log(`Loaded event: ${event.name}`);
    }
};

// Load commands
const loadCommands = (): void => {
    const commandsPath: string = path.join(__dirname, 'commands');
    const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath: string = path.join(commandsPath, file);
        const command: Command = require(filePath);

        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
};

// Initialize bot
const initBot = async (): Promise<void> => {
    try {
        // Load events and commands
        loadEvents();
        loadCommands();

        // Check for Discord token
        const token = process.env.DISCORD_TOKEN;
        if (!token) {
            throw new Error('DISCORD_TOKEN is missing in the environment variables');
        }

        // Login to Discord with token from .env
        await client.login(token);
        console.log(`Logged in as ${client.user?.tag || 'unknown'}`);
    } catch (error) {
        console.error('Error initializing bot:', error);
        process.exit(1);
    }
};

// Start the bot
initBot();