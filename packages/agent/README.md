# Sero Agent Package

The Sero Agent package is a Discord bot framework built with Discord.js and TypeScript that provides AI-powered functionality through integration with OpenAI and Anthropic Claude.

## Features

- **Discord Bot Integration**: Built on Discord.js with full TypeScript support
- **AI Integration**: Connects with OpenAI and Claude for intelligent responses
- **Tool System**: Modular tool system for extending bot capabilities
- **Image Generation**: Create and edit images using DALL-E models
- **Discord Utilities**: Send messages, fetch channel history, perform moderation actions

## Getting Started

### Prerequisites

- Node.js 18.20.0 or higher
- Discord Bot Token
- OpenAI API Key (for image generation)
- Anthropic API Key (for Claude integration)

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

## Project Structure

- `/commands`: Discord slash commands
- `/events`: Discord event handlers
- `/services`: Integration with external services (OpenAI, Claude)
- `/tools`: Tool implementations for AI assistants
- `/types`: TypeScript type definitions
- `/utils`: Utility functions and helpers

## Creating New Tools

Tools extend the AI assistant's capabilities:

```typescript
import { ClaudeToolType } from "../types/tool.types";

export class MyNewTool extends ClaudeToolType {
  static getToolContext() {
    return {
      name: "tool_name",
      description: "Tool description",
      input_schema: {
        type: "object",
        properties: {
          // Define input properties
        },
        required: [],
      },
    };
  }
  
  async execute(input) {
    // Implement tool functionality
  }
}
```

## License

MIT
