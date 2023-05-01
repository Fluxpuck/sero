/* FluxBot
 Intented for Private use only
 Copyright © 2023
*/

// → Get credentials
require('dotenv').config({ path: './config/.env' });

// → Setup DiscordJS Client
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const INTENTS_BITFIELD = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages];
const client = new Client({ intents: [INTENTS_BITFIELD], partials: [Partials.GuildMember, Partials.Channel, Partials.Message] });

//→ Set Client information 
client.commands = new Collection();
client.events = new Collection();
client.dependencies = require('./package.json').dependencies
client.version = require('./package.json').version

// → Listen to Client events
const events = require('./utils/EventManager');
events.run(client); //run the events

// → Login to Discord API
client.login(process.env.DISCORD_TOKEN);