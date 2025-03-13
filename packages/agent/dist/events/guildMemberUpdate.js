"use strict";
// events/guildMemberUpdate.ts
const discord_js_1 = require("discord.js");
const event = {
    name: discord_js_1.Events.GuildMemberUpdate,
    once: false,
    execute(oldMember, newMember) {
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
module.exports = event;
