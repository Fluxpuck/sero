// events/guildMemberUpdate.ts
import { Events, GuildMember } from 'discord.js';
import { Event } from '../types/event.types';

const event: Event = {
    name: Events.GuildMemberUpdate,
    once: false,
    execute(oldMember: GuildMember, newMember: GuildMember) {
        // Check if roles were changed
        if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
            console.log(`Member ${newMember.user.tag} roles were updated.`);

            // You can add custom logic here, such as logging to a channel
            // Example:
            // const logChannel = newMember.guild.channels.cache.find(channel => channel.name === 'logs');
            // if (logChannel && logChannel.isTextBased()) logChannel.send(`Member ${newMember.user.tag} roles were updated.`);
        }
    },
};

export = event;