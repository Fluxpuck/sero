const { AuditLogEvent, AttachmentBuilder } = require('discord.js');
const { getRequest, postRequest } = require("../database/connection");
const { getAuditLogType } = require('../lib/discord/auditlogevent');
const { unixTimestamp } = require('../lib/helpers/TimeDateHelpers/timeHelper');
const { logEmbed } = require('../assets/embed');

module.exports = async (client, oldMember, newMember) => {

    // Get Guild from the oldMember
    const { guild } = oldMember

    try {

        // Get the member log channel from the database
        const member_log_channel = await getRequest(`/guilds/${guild.id}/settings/member-logs`);
        if (member_log_channel.status !== 200) return;

        // Get channel from request and send message
        const logChannel = await guild.channels.fetch(member_log_channel.data.channelId);
        if (!logChannel) return;

        /**
         * If the user's name has changed, store the change in the user activities
         * And send a message to the member log channel
         */
        if (oldMember.displayName !== newMember.displayName
            && oldMember.nickname !== null) {

            // Construct the message content
            const content = `<t:${unixTimestamp()}> - **${oldMember.displayName}** changed their name to **${newMember.displayName}**`
            const footer = `-# <@${oldMember.id}> | ${oldMember.id}`

            const embedMessage = logEmbed({
                description: content,
                footer: footer
            })

            logChannel.send({
                embeds: [embedMessage]
            });

            // Store the name change in the database
            const result = await postRequest(`/guilds/${guild.id}/activities`, {
                guildId: guild.id,
                userId: oldMember.id,
                type: "update-name",
                additional: {
                    oldName: oldMember.displayName,
                    newName: newMember.displayName,
                }
            });

            if (result.status !== 200 && result.status !== 201) {
                console.error(`Failed to store name change to user activities`, result);
            }

            if (process.env.NODE_ENV === "development") {
                console.log("\x1b[2m", `[Event]: ${result?.data?.message}`);
            }

        }


        /**
         * If the user's avatar has changed, store the change in the user activities
         * And send a message to the member log channel
         */
        if (oldMember.user.avatar !== newMember.user.avatar) {

            // // Create the avatar attachments
            // const oldAvatar = new AttachmentBuilder(oldMember.user.displayAvatarURL());
            // const newAvatar = new AttachmentBuilder(newMember.user.displayAvatarURL());

            // // Construct the message content
            // const content = `<t:${unixTimestamp()}> - **${oldMember.displayName}** changed their avatar`
            // const footer = `-# <@${oldMember.id}> | ${oldMember.id}`

            // const embedMessage = logEmbed({
            //     description: content,
            //     footer: footer
            // })

            // logChannel.send({
            //     embeds: [embedMessage],
            //     files: [oldAvatar, newAvatar]
            // });

            // // Store the name change in the database
            // const result = await postRequest(`/guilds/${guild.id}/activities`, {
            //     guildId: guild.id,
            //     userId: oldMember.id,
            //     type: "update-avatar",
            //     additional: {
            //         oldAvatar: oldMember.user.displayAvatarURL(),
            //         newAvatar: newMember.user.displayAvatarURL(),
            //     }
            // });

            // if (result.status !== 200 && result.status !== 201) {
            //     console.error(`Failed to store avatar change to user activities`, result);
            // }

            // if (process.env.NODE_ENV === "development") {
            //     console.log("\x1b[2m", `[Event]: ${result?.data?.message}`);
            // }

        }


        /**
         * If the user's roles have changed, store the change in the user activities
         * And send a message to the member log channel
         */
        if (oldMember._roles.length !== newMember._roles.length) {

            // Needs checking, because the roles are not always updated correctly
            // Its fucking annoying

            // // Get the added and removed roles
            // const addedRolesIds = newMember._roles.filter(role => !oldMember._roles.includes(role));
            // const removedRolesIds = oldMember._roles.filter(role => !newMember._roles.includes(role));

            // if (addedRolesIds.length >= 0 || removedRolesIds.length >= 0) {

            //     // Get the role objects from the role ids
            //     const addedRolesNames = addedRolesIds.map(roleId => guild.roles.cache.get(roleId)?.name || 'Unknown Role').join(', ');
            //     const removedRolesNames = removedRolesIds.map(roleId => guild.roles.cache.get(roleId)?.name || 'Unknown Role').join(', ');

            //     console.log(addedRolesNames, removedRolesNames);

            //     // Construct the message content
            //     let content = `<t:${unixTimestamp()}> - **${oldMember.displayName}** roles have been updated\n`;
            //     if (addedRolesNames.length > 0) {
            //         content += `> **Added Roles:** ${addedRolesNames}\n`;
            //     }
            //     if (removedRolesNames.length > 0) {
            //         content += `> **Removed Roles:** ${removedRolesNames}\n`;
            //     }
            //     const footer = `-# <@${oldMember.id}> | ${oldMember.id}`;

            // const embedMessage = logEmbed({
            //     description: content,
            //     footer: footer
            // })

            // logChannel.send({
            //     embeds: [embedMessage]
            // });

            //     // Store the role changes in the database
            //     const result = await postRequest(`/guilds/${guild.id}/activities`, {
            //         guildId: guild.id,
            //         userId: oldMember.id,
            //         type: "update-roles",
            //         additional: {
            //             addedRoles: addedRolesNames,
            //             removedRoles: removedRolesNames,
            //         }
            //     });

            //     if (result.status !== 200 && result.status !== 201) {
            //         console.error(`Failed to store roles change to user activities`, result);
            //     }

            //     if (process.env.NODE_ENV === "development") {
            //         console.log("\x1b[2m", `[Event]: ${result?.data?.message}`);
            //     }
            // }

        }

    } catch (error) {
        console.error(`Error processing user updates ${oldMember.id}:`, error);
    }
};