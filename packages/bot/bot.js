const { join } = require('path');
require("dotenv").config({ path: join(__dirname, '.', 'config', '.env') });

// → Setup DiscordJS Client
const NodeCache = require("node-cache");
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const INTENTS_BITFIELD = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildModeration];
const client = new Client({ intents: [INTENTS_BITFIELD], partials: [Partials.GuildMember, Partials.Channel, Partials.Message] });

//→ Set Client information 
client.commands = new Collection();
client.events = new Collection();
client.cooldowns = new NodeCache();
client.dependencies = require('./package.json').dependencies
client.version = require('./package.json').version

// → Listen to Client events
const events = require('./utils/EventManager');
events.run(client); //run the events

// → Login to Discord API
client.login(process.env.NODE_ENV === "production"
    ? process.env.SERO_TOKEN
    : process.env.DEVELOPMENT_TOKEN);