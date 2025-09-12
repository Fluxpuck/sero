# Context Guidelines for Developing in packages/sero

## Architecture Overview

The Sero Bot package is the core Discord bot implementation that provides moderation tools, user management, and event handling for Discord servers. It's built on Discord.js and communicates with the API service for database operations.

## Command Development

### Command Structure

1. **Basic Command Template**:
   ```typescript
   import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
   import { Command } from "../../types/client.types";

   const command: Command = {
     data: new SlashCommandBuilder()
       .setName("command-name")
       .setDescription("Command description")
       // Add options and permissions here
     cooldown: 30, // Optional cooldown in seconds

     async execute(interaction: ChatInputCommandInteraction) {
       // Command implementation
     },
   };

   export default command;
   ```

2. **Command Organization**:
   - Place commands in appropriate category folders under `/commands`
   - Use descriptive filenames that match the command name
   - Group related commands in the same directory

3. **Command Options**:
   - Use the SlashCommandBuilder methods to add options
   - Validate user input before processing
   - Provide clear error messages for invalid inputs

4. **Permissions**:
   - Set appropriate permission requirements using `.setDefaultMemberPermissions()`
   - Check for additional permissions in the execute method if needed

5. **Cooldowns**:
   - Set a `cooldown` property to prevent command spam
   - The cooldown system is automatically handled by the interaction handler

### API Communication

1. **Using getRequest**:
   ```typescript
   import { getRequest } from "../../database/connection";

   // Example: Fetch user data
   const response = await getRequest(`/users/${guildId}/${userId}`);
   if (response.status === "success") {
     const userData = response.data;
     // Process user data
   }
   ```

2. **Using postRequest**:
   ```typescript
   import { postRequest } from "../../database/connection";

   // Example: Update user balance
   const response = await postRequest(`/users/${guildId}/${userId}/balance`, {
     amount: 100,
     type: "wallet"
   });
   if (response.status === "success") {
     // Handle successful update
   }
   ```

3. **Error Handling**:
   - Always check the response status before accessing data
   - Provide user-friendly error messages
   - Log detailed errors for debugging

## Event Handling

### Event Structure

1. **Basic Event Template**:
   ```typescript
   import { Events } from "discord.js";
   import { Event } from "../types/client.types";

   const event: Event = {
     name: Events.EventName, // Use Discord.js Events enum
     once: false, // Set to true for events that should only run once
     async execute(...args) {
       // Event implementation
     },
   };

   export default event;
   ```

2. **Event Types**:
   - **Discord Events**: Handle native Discord events (message creation, interactions)
   - **Redis Events**: Handle custom events from the API service (birthdays, rewards)

3. **Event Organization**:
   - Use descriptive filenames that match the event name
   - Group related event handlers logically

### Best Practices

1. **Response Times**:
   - Acknowledge interactions quickly (within 3 seconds)
   - Use deferred replies for operations that take longer
   - Follow up with detailed responses after processing

2. **Error Handling**:
   - Wrap event handlers in try/catch blocks
   - Log errors with context information
   - Provide user feedback when appropriate

3. **Performance**:
   - Minimize API calls when possible
   - Use caching for frequently accessed data
   - Avoid blocking operations in event handlers

## Command Deployment

1. **Registering Commands**:
   - Commands are automatically discovered from the `/commands` directory
   - Run `npm run deploy` to register slash commands with Discord
   - Global commands can take up to an hour to propagate

2. **Testing Commands**:
   - Test commands thoroughly before deployment
   - Use a development bot for testing
   - Verify all command options and interactions

## Security Considerations

1. **Input Validation**:
   - Validate all user inputs before processing
   - Sanitize data before sending to the API
   - Use parameterized queries to prevent injection attacks

2. **Permission Checks**:
   - Always verify user permissions before executing sensitive commands
   - Implement additional permission checks beyond Discord's system when needed

3. **API Communication**:
   - Use the provided request utilities for all API communication
   - Never expose API keys or tokens in responses
   - Handle API errors gracefully
