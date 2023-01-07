/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    Flux is a comprehensive Discord moderation bot, developed for private use. */

//get credentials through dot envoirement
require('dotenv').config({ path: './config/.env' });

//load npm modules
const NodeCache = require("node-cache");

//setup DiscordJS Client
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const INTENTS_BITFIELD = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages];
const client = new Client({ intents: [INTENTS_BITFIELD], partials: [Partials.Channel] });

//set Client information 
client.commands = new Collection();
client.events = new Collection();
client.cooldowns = new NodeCache();
client.dependencies = require('./package.json').dependencies
client.version = require('./package.json').version

//listen to Client events
const events = require('./utils/EventManager');
events.run(client); //run the events

//client login to discord
client.login(process.env.TOKEN);

// → scheduled tasks
var cron = require('node-cron');
cron.schedule('0 1 * * *', () => {
    client.emit('applicationTimer')
}, {
    scheduled: true,
    timezone: "Europe/Amsterdam"
});