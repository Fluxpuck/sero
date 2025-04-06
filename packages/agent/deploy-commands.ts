// deploy-commands.ts
import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Command } from './types/command.types';

dotenv.config({ path: path.join(__dirname, '.', 'config', '.env') });

const commands: any[] = [];
const commandsPath: string = path.join(__dirname, 'commands');
const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath: string = path.join(commandsPath, file);
    const command: Command = require(filePath);

    if ('data' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
    }
}

if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is missing in the environment variables');
}

if (!process.env.CLIENT_ID) {
    throw new Error('CLIENT_ID is missing in the environment variables');
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands globally.`);

        // The put method is used to fully refresh all commands
        // Using applicationCommands instead of applicationGuildCommands for global commands
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            { body: commands },
        );

        console.log(`Successfully reloaded ${Array.isArray(data) ? data.length : 0} global application (/) commands.`);
        console.log('Note: Global commands can take up to 1 hour to update across all servers.');
    } catch (error) {
        console.error(error);
    }
})();