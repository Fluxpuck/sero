const { join } = require('path');
require("dotenv").config({ path: join(__dirname, '.', 'config', '.env') });

// → Setup DiscordJS Client
const NodeCache = require("node-cache");
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const INTENTS_BITFIELD = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildVoiceStates];
const client = new Client({ intents: [INTENTS_BITFIELD], partials: [Partials.GuildMember, Partials.Channel, Partials.Message] });

//→ Set Client information 
client.commands = new Collection();
client.events = new Collection();
client.cooldowns = new NodeCache();
client.dependencies = require('./package.json').dependencies
client.version = require('./package.json').version
client.redis = false;
client.postgres = false;

// → Listen to Client events
const events = require('./utils/EventManager');
events.run(client); //run the events

// → Subscribe to Redis channels
const { redisClient, subscribeToChannel } = require('./database/subscriber');
subscribeToChannel(client);

// → Login to Discord API
client.login(process.env.NODE_ENV === "production"
  ? process.env.PRODUCTION_TOKEN
  : process.env.DEVELOPMENT_TOKEN).then(async () => {

    // → Check API connection
    const { baseRequest } = require('./database/connection');
    const apiConnection = await baseRequest();

    const isRedisConnected = redisClient?.status === 'ready';
    const isApiConnected = apiConnection?.status === 200;

    client.redis = isRedisConnected;
    client.postgres = isApiConnected;

    // → Displays a welcome message in the console 
    // to indicate that the bot has successfully started up.
    console.log("\x1b[33m", `
      _______ _______ _______   _______ 
     |       |       |    _  \\ |       |
     |  _____|    ___|   | |  ||   _   |
     | |_____|   |___|   |_| /_|  | |  |
     |_____  |    ___|    __   |  |_|  |
      _____| |   |___|   |  |  |       |
     |_______|_______|___|  |__|_______|

      Discord bot - Startup details:
       > ${new Date().toUTCString()}
       > ${client.user.tag}
       > ${isRedisConnected ? 'Redis is connected' : 'Redis is not connected!'}
       > ${isApiConnected ? 'Sero-api is connected' : 'Sero-api is not connected!'}
      `);


  });