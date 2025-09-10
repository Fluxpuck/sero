# Sero API Package

The Sero API package is a backend service that provides RESTful endpoints, database management, and scheduled tasks for the Sero Discord bot ecosystem.

## Features

- **RESTful API**: Express-based API with proper middleware for security and performance
- **Database Integration**: Sequelize ORM with PostgreSQL for data persistence
- **Redis Integration**: Caching and pub/sub messaging system
- **Scheduled Tasks**: Cron jobs for automated actions like birthday messages and reward drops
- **Logging System**: Comprehensive logging for monitoring and debugging
- **User Management**: Track user data, experience, economy, and more
- **Guild Management**: Server-specific settings and configurations

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database
- Redis server

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `config/.env`

3. Start the API server:
   ```bash
   npm start
   ```

4. For development with auto-reload:
   ```bash
   npm run dev
   ```

## Database Models

The API package includes numerous models for tracking:

- Users and their profiles
- Discord guilds and settings
- Experience and leveling system
- Economy and balance tracking
- User activity and audit logs
- Temporary roles and bans
- Birthdays and special events
- Commands and their usage

## Cron Jobs

Scheduled tasks include:

- **Birthday Messages**: Sends birthday announcements to configured channels
- **Reward Drops**: Distributes periodic rewards to active users
- **Temporary Ban Management**: Automatically revokes temporary bans when they expire
- **Temporary Role Management**: Removes temporary roles when they expire

## API Endpoints

The API provides endpoints for:

- User data and statistics
- Guild settings and configuration
- Economy and experience logs
- Command usage tracking
- Health monitoring

## Development

- `npm run dev`: Run with hot-reload for development
- `npm run seed`: Seed the database with initial data

## Project Structure

- `/routes`: API endpoint definitions
- `/models`: Sequelize database models
- `/middleware`: Express middleware for routes, errors, and caching
- `/cron`: Scheduled tasks and jobs
- `/database`: Database configuration and seeders
- `/redis`: Redis client configuration and pub/sub channels
- `/utils`: Utility functions for validation, logging, and responses

## License

MIT
