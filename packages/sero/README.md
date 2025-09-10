# Sero Bot Package

The Sero Bot package is the core Discord bot implementation that provides moderation tools, user management, and event handling for Discord servers.

## Features

- **Discord Integration**: Built with Discord.js for reliable interaction with Discord's API
- **Moderation Commands**: Ban, kick, timeout, warn, and other moderation tools
- **Birthday System**: Track and celebrate user birthdays with automated messages
- **Redis Integration**: Subscribe to events from the API service
- **Permission System**: Role-based permission handling for commands
- **Database Connection**: API client for communicating with the backend service

## Getting Started

### Prerequisites

- Node.js 18.20.0 or higher
- Discord Bot Token
- Redis server (for event subscription)
- API service running (for database operations)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `config/.env`

3. Build the project:
   ```bash
   npm run build
   ```

4. Deploy slash commands:
   ```bash
   npm run deploy
   ```

5. Start the bot:
   ```bash
   npm start
   ```

## Development

- `npm run dev`: Run the bot in development mode
- `npm run watch`: Watch for file changes and rebuild
- `npm run deploy`: Register slash commands with Discord

## Commands

For a comprehensive list of all available commands with detailed descriptions and options, please refer to the [Commands Documentation](/docs/commands.md).

## Event Handling

The bot listens for various events including:
- Discord events (message creation, interactions)
- Redis events (birthday notifications, reward drops, temporary role/ban management)

## Project Structure

- `/commands`: Discord slash command implementations
- `/events`: Event handlers for Discord and Redis events
- `/database`: API client for database operations
- `/redis`: Redis subscription handling
- `/types`: TypeScript type definitions
- `/utils`: Utility functions for permissions, messages, etc.

## License

MIT
