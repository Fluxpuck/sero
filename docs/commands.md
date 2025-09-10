# Sero Bot Commands

This document provides an overview of commands available in the Sero Bot, organized by category.

## Command Categories

### Moderation Commands

| Command | Options | Required Permission |
|---------|--------|--------------------|
| `/ban` - Temporarily ban a user | `user` (required), `reason` (required), `duration` (optional) | Ban Members |
| `/perm-ban` - Permanently ban a user | `user` (required), `reason` (required) | Ban Members |
| `/kick` - Remove a user from the server | `user` (required), `reason` (required) | Kick Members |
| `/timeout` - Temporarily mute a user | `user` (required), `reason` (required), `duration` (optional) | Moderate Members |
| `/warn` - Issue a warning to a user | `user` (required), `reason` (required) | Manage Messages |
| `/clear` - Delete messages in bulk | `amount` (required) | Manage Messages |
| `/purge` - Remove messages from a specific user | `user` (required), `amount` (optional) | Manage Messages |
| `/info` - Get information about a user | `user` (optional) | Send Messages |
| `/unban` - Unban a user from the server | `user` (required), `reason` (optional) | Ban Members |
| `/disconnect` - Disconnect a user from voice | `user` (required), `reason` (required) | Move Members |

### Birthday Commands

| Command | Options | Required Permission |
|---------|--------|--------------------|
| `/birthday` - Set your birthday | `month` (required), `day` (required), `year` (optional) | Send Messages |
| `/my-birthday` - View your registered birthday | None | Send Messages |
| `/upcoming-birthday` - List upcoming birthdays | `amount` (optional) | Send Messages |

### Miscellaneous Commands

| Command | Options | Required Permission |
|---------|--------|--------------------|
| `/ping` - Check bot latency | None | Manage Guild |
| `/bot` - View bot information | None | Send Messages |

## Command Usage

To use a command, type a forward slash `/` followed by the command name in any text channel where the bot has access. Discord will show a list of available commands and their options.

For commands with autocomplete options, start typing and a dropdown menu will appear with suggestions.

## Common Command Options

Many commands share similar option patterns:

- User selection: Most moderation commands require a `user` option to select the target user
- Reason: Moderation actions typically require a `reason` option to document the action
- Duration: Time-based actions like bans and timeouts often have a `duration` option

## Permissions

Commands require specific Discord permissions as listed in the tables above. Both the user and the bot must have appropriate permissions for commands to work properly.
