"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// deploy-commands.ts
const dotenv_1 = __importDefault(require("dotenv"));
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const commands = [];
const commandsPath = path_1.default.join(__dirname, 'commands');
const commandFiles = fs_1.default.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path_1.default.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command) {
        commands.push(command.data.toJSON());
    }
    else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
    }
}
if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is missing in the environment variables');
}
if (!process.env.CLIENT_ID) {
    throw new Error('CLIENT_ID is missing in the environment variables');
}
const rest = new discord_js_1.REST().setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands globally.`);
        // The put method is used to fully refresh all commands
        // Using applicationCommands instead of applicationGuildCommands for global commands
        const data = await rest.put(discord_js_1.Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log(`Successfully reloaded ${Array.isArray(data) ? data.length : 0} global application (/) commands.`);
        console.log('Note: Global commands can take up to 1 hour to update across all servers.');
    }
    catch (error) {
        console.error(error);
    }
})();
