# Sero Bot

<img align="right" alt="PNG" height="92px" src="https://cdn.discordapp.com/avatars/553561246339956766/1fdbd18451a72220ab43ec3165b7e69c.png" />
<p>Welcome to the Sero GitHub Repository. Sero is a comprehensive Discord bot ecosystem built with TypeScript using the <a href="https://discord.js.org/">Discord.js</a> library. The project features a modular architecture with multiple packages that work together to provide moderation tools, user management, AI-powered interactions, and other helpful functionality for Discord servers.</p>

## Project Overview

Sero Bot is structured as a monorepo with three main packages:

### Packages

- **[Sero Bot](/packages/sero)**: Core Discord bot implementation with moderation tools, user management, and event handling
- **[Sero API](/packages/api)**: Backend service providing RESTful endpoints, database management, and scheduled tasks
- **[Sero Agent](/packages/agent)**: AI-powered Discord bot framework with OpenAI and Claude integration

## Features

- **Moderation System**: Ban, kick, timeout, warn, and other moderation tools
- **User Management**: Track user data, experience, economy, and more
- **Birthday System**: Track and celebrate user birthdays with automated messages
- **AI Integration**: Connect with OpenAI and Claude for intelligent responses
- **Image Generation**: Create and edit images using DALL-E models
- **Scheduled Tasks**: Automated actions like birthday messages and reward drops
- **Database Integration**: Persistent storage of user data and server settings
- **Redis Integration**: Caching and pub/sub messaging between services

## Architecture

The project uses a microservices architecture with the following components:

- **Discord Bot (Sero)**: Handles Discord interactions and commands
- **API Service**: Manages data persistence and business logic
- **Agent Service**: Provides AI-powered features and tools
- **PostgreSQL**: Database for persistent storage
- **Redis**: Message broker and caching layer

## Getting Started

### Requirements

- Node.js 18.20.0 or higher
- NPM
- Docker and Docker Compose

### Development Setup

All the required external services are configured in the Docker Compose file. This contains the **PostgreSQL** database and the **Redis** message broker.

#### 1. Installation

Install dependencies and create Docker containers:

```bash
# Install dependencies
npm install

# Start Docker containers
docker-compose -f docker-compose-local.yml up -d
```

#### 2. Environment Configuration

Create `.env` files in the config directory of each package:

- API Package: `packages/api/config/.env`
- Sero Bot Package: `packages/sero/config/.env`
- Agent Package: `packages/agent/config/.env`

Refer to each package's README for the required environment variables.

#### 3. Database Seeding

Seed the database with initial data:

```bash
npm run seedmanager
```

#### 4. Running the Services

Start each service in separate terminals:

```bash
# Start API service
npm run start-api

# Start Sero bot
npm run start-sero

# Start Agent bot
npm run start-agent
```

_VSCode users can utilize the built-in [Debugger](https://code.visualstudio.com/docs/editor/debugging) to run different applications more easily._

## Development Guidelines

### Code Format

When using VSCode, configure automatic code formatting:

1. Open `File → Preferences → Settings (CTRL + ,)`
2. Go to `Text Editor → Formatting`
3. Enable `Format On Paste` & `Format On Save`

### Package Documentation

Each package has its own detailed README:

- [Sero Bot Documentation](/packages/sero/README.md)
- [Sero API Documentation](/packages/api/README.md)
- [Sero Agent Documentation](/packages/agent/README.md)

### Troubleshooting

Most issues can be resolved by:

- Reinstalling dependencies: `npm install`
- Restarting Docker containers: `docker-compose -f docker-compose-local.yml restart`
- Rerunning the database seeder: `npm run seedmanager`
- Checking environment variables in each package's `.env` file

## Contributing

This project is ticket-based and managed using [Linear](https://linear.app/sero-bot). Development goes per ticket and branches are to be created from the main `development` branch, using the `issue-id` from the ticket.

### Development Workflow

1. Check out the `development` branch
2. Create a new branch using the ticket ID: `git checkout -b issue-123`
3. Make your changes following the project guidelines
4. Submit a pull request to the `development` branch

Please read the [Git Guide](/docs/git-guide.md) for detailed information on managing the code and the [Interactions Guide](/docs/interactions.md) for information on implementing Discord interactions.

### Commit Messages

We follow the [Semantic Commit Messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716) convention:

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation changes
- `style`: formatting, missing semicolons, etc.
- `refactor`: code change that neither fixes a bug nor adds a feature
- `test`: adding tests
- `chore`: updating build tasks, package manager configs, etc.

## Contributors

Created with ❤ by
[Fluxpuck](https://github.com/Fluxpuck)

Code Contributors:
[ZakariaX1](https://github.com/ZakariaX1),
[ZEUSGMJ](https://github.com/ZEUSGMJ),
[TheFallenShade](https://github.com/TheFallenShade)

## License

MIT
