/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    Hyper is a comprehensive Discord moderation bot, developed for private use.
    Developed on Discord.js v13.3.1 and Discord Rest API v9 */

//get credentials through dot envoirement
require('dotenv').config({ path: './config/.env' });

//setup DiscordJS Client
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const INTENTS_BITFIELD = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent];
const client = new Client({ intents: [INTENTS_BITFIELD], partials: [Partials.Channel] });

//set Client information 
client.commands = new Collection();
client.events = new Collection();
client.dependencies = require('./package.json').dependencies
client.version = require('./package.json').version

//listen to Client events
const events = require('./utils/EventManager');
events.run(client); //run the events

//client login to discord
client.login(process.env.TOKEN);