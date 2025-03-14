"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts - Main bot file
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = require("discord.js");
dotenv_1.default.config();
// Create client instance with necessary intents
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMembers,
    ]
});
// Initialize commands collection
client.commands = new discord_js_1.Collection();
// Load events
const loadEvents = () => {
    const eventsPath = path_1.default.join(__dirname, 'events');
    const eventFiles = fs_1.default.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path_1.default.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`Loaded event: ${event.name}`);
    }
};
// Load commands
const loadCommands = () => {
    const commandsPath = path_1.default.join(__dirname, 'commands');
    const commandFiles = fs_1.default.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path_1.default.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name}`);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
};
// Initialize bot
const initBot = async () => {
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
    }
    catch (error) {
        console.error('Error initializing bot:', error);
        process.exit(1);
    }
};
// Start the bot
initBot();
