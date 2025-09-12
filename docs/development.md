# Development Setup

This document provides detailed instructions for setting up the Sero Bot development environment.

## Requirements

- Node.js 18.20.0 or higher
- NPM
- Docker and Docker Compose

## Development Setup

All the required external services are configured in the Docker Compose file. This contains the **PostgreSQL** database and the **Redis** message broker.

### 1. Installation

Install dependencies and create Docker containers:

```bash
# Install dependencies
npm install

# Start Docker containers
docker-compose -f docker-compose-local.yml up -d
```

### 2. Environment Configuration

Create `.env` files in the config directory of each package:

- API Package: `packages/api/config/.env`
- Sero Bot Package: `packages/sero/config/.env`
- Agent Package: `packages/agent/config/.env`

Refer to each package's README for the required environment variables.

### 3. Database Seeding

Seed the database with initial data:

```bash
npm run seedmanager
```

### 4. Running the Services

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

## Troubleshooting

Most issues can be resolved by:

- Reinstalling dependencies: `npm install`
- Restarting Docker containers: `docker-compose -f docker-compose-local.yml restart`
- Rerunning the database seeder: `npm run seedmanager`
- Checking environment variables in each package's `.env` file

## Code Format

When using VSCode, configure automatic code formatting:

1. Open `File → Preferences → Settings (CTRL + ,)`
2. Go to `Text Editor → Formatting`
3. Enable `Format On Paste` & `Format On Save`
