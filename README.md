# Sero
<img align="right" alt="PNG" height="92px" src="https://cdn.discordapp.com/avatars/553561246339956766/1fdbd18451a72220ab43ec3165b7e69c.png" />
<p>Welcome to the Sero GitHub Repository. Sero is a cool multifunctional Discord bot written in Javascript using the <a href="https://discord.js.org/">DiscordJS</a> library. The bot is meant to help servers with moderator and to add cool and helpful functionality for its members.</p>

## Getting Started
### Requirements:
- NodeJS
- NPM
- Docker

### Modules
- [Sero API](https://github.com/Fluxpuck/sero/tree/development/packages/api)
- [Sero Bot](https://github.com/Fluxpuck/sero/tree/development/packages/bot)

### Development
All the required external services are configured in the [Docker Compose](https://github.com/Fluxpuck/sero/blob/development/docker-compose-dev.yml) file. This contains the **Postgres** database and the **Redis** message-broker. Follow the next steps to setup the development environment.

#### 1. Installation
Install the `node_modules` and create the docker containers using the following commands.

```
npm install
```

```
docker-compose -f docker-compose-dev.yml up
```
#### 2. Secrets
Before we can run anything, we need to make sure to add a `.env` file in `\packages\api\config\` & `\packages\bot\config\`. The bot and api secret should both include a `NODE_ENV=development`, and the bot secret should also include a `DEVELOPMENT_TOKEN=<bot-token-here>`. The Discord bot application token can generated on the [Discord Developers](https://discord.com/developers/applications) website. 

#### 3. Seeding
Running development with an empty database is very difficult to work with! Always make sure to run the **SeedManager**. This will add truncate the database and seed the database with example data. 

When you add new models/tables and routes in the API, make sure you add some dummy data. that is useful during development.

```
npm seedmanager
```

#### 4. Running
Run the following scripts to start the API and Bot.
```
npm start-api
npm start-bot
```
_Additionally, **VSCode** has a great build-in [Debugger](https://code.visualstudio.com/docs/editor/debugging) to make it easier to run the different applications. See the image below._

![image](https://github.com/Fluxpuck/sero/assets/33183946/46f5bbc2-4059-4c0a-a73a-ccae47cd821d)

## Code Format
When using **VSCode** code can be formatted automatically
1. Open `File → Preferences → Settings (CTRL + ,)`
2. Go to `Text Editor → Formatting`
3. Enabble `Format On Paste` & `Format On Save`

## GitHub
This project is ticket-based and managed using [Linear](https://linear.app/sero-bot). Development goes per ticket and branches are to be created from the main `development` branch, using the `issue-id` from the ticket. Please read the [Git Guide](https://github.com/Fluxpuck/sero/blob/development/docs/git-guide.md) for all information on managing the code.

## Troubleshooting
Most issues can be resolved by (re)installing the `node_modules` and/or (re)running the **SeedManager**.

### Contributors
Created with ❤ by
 [Fluxpuck](https://github.com/Fluxpuck) |
 [ZeusGMJ](https://github.com/ZEUSGMJ) |
 [Zakaria](https://github.com/ZakariaX1) |
 [Jackson](https://github.com/ItsJackson)
