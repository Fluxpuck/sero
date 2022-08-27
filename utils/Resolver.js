/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    The Resolver contains all functions parsing and collecting information */

//require packages & functions
const mysql = require('mysql');
const { time } = require('./functions');
const { MessageMentions: { USERS_PATTERN, CHANNELS_PATTERN, ROLES_PATTERN }, Collection } = require('discord.js');

module.exports = {

    /** Get user information from input
     * @param {Collection} guild 
     * @param {String} input 
     * @returns 
     */
    async getUserFromInput(guild, input) {
        if (!input) return false;

        //filter input
        let mention = new RegExp('<@!?([0-9]+)>', 'g').exec(input)
        let item = mention != null ? mention[1] : input.trim()

        //fetch member from guild
        try {
            var member = await guild.members.fetch(item)
                || await guild.members.cache.get(item)
                || await guild.members.cache.find(m => m.id == item)

            //if member value is present, return member
            if (!member) return false;
            else return member;

        } catch (err) {
            return false
        }

    },

    /** Get channel information from input
     * @param {*} guild 
     * @param {*} input 
     */
    async getChannelfromInput(guild, input) {
        if (!input) return false;

        let channel //setup channel value

        //filter input [1]
        let mention = new RegExp('<#([0-9]+)>', 'g').exec(input)
        let item = mention != null ? mention[1] : input.trim()

        //filter input [2]
        let filter = mysql.escape(item.replace(',', ''))
        let filter_item = filter.substring(1).slice(0, -1).trim()

        //get Channel by id
        if (filter_item.match(/^[0-9]+$/)) {
            channel = await guild.channels.cache.get(filter_item) //get channel straight from channel cache
            if (!channel) { channel = await guild.channels.cache.find(channel => channel.id == filter_item) } //find channel in channel cache
            else if (!channel) { channel = await guild.channels.fetch(filter_item) } //fetch channel straight from guild
            //if channel is found (by id) return channel
            if (channel) return channel;
        }

        //if channel value is still empty, return false
        if (!channel) return false;

    },

    /** Collect Member message details
     * @param {*} member 
     * @returns 
     */
    async filterMessagePool(memberId, messagePool) {
        function memberMessageLogs(activeMinutes, messageCount, editCount, channelCount, mentionCount, attachCount, stickerCount, gifCount, commandCount) {
            this.activeMinutes = activeMinutes;
            this.messageCount = messageCount;
            this.editCount = editCount;
            this.channelCount = channelCount;
            this.mentionCount = mentionCount;
            this.attachCount = attachCount;
            this.stickerCount = stickerCount;
            this.gifCount = gifCount;
            this.commandCount = commandCount;
        }

        //transform collection to array & get all user messages
        const messageCollection = messagePool.map(m => m);
        //collect all user messages
        const userCollection = messageCollection.filter(m => m.author.id === memberId);
        //collect all editted messages || filter for editted messages
        const editCollection = userCollection.filter(m => m.editedTimestamp != null);
        //collect active minutes || calculate unique minutes for every hour
        const timeCollection = [...new Set(userCollection.map(m => time(new Date(m.createdTimestamp))))];
        //collect channel count || calculate unique channels in array
        const channelCollection = [...new Set(userCollection.map(m => m.channelId))];
        //collect mention count || filter for messages with mention(s)
        const mentionCollection = userCollection.filter(m => m.mentions.size >= 1)
        //collect attachment count || filter for messages with attachment(s)
        const attachCollection = userCollection.filter(m => m.attachments.size >= 1);
        //collect sticker count || filter for messages with sticker(s)
        const stickerCollection = userCollection.filter(m => m.stickers.size >= 1);
        //collect (tenor) gif count || filter for messages with tenor-url
        const gifCollection = userCollection.filter(m => m.content.indexOf('https://tenor.com/view/') != -1);
        //collect (possible) executed Hyper commands || filter for Hyper's prefix
        const commandCollection = userCollection.filter(m => m.content.startsWith('.'))

        //return member message details
        const MemberMsgDetails = new memberMessageLogs(timeCollection, userCollection, editCollection, channelCollection, mentionCollection, attachCollection, stickerCollection, gifCollection, commandCollection)
        return MemberMsgDetails;
    },

    /** Get all members from a roleId
     * @param {*} guild 
     * @param {*} roleId 
     */
    async getMembersFromRole(guild, roles) {
        //setup member collection
        const memberCollection = new Collection;

        //go over each role and collect the members;
        for await (let r of roles) {
            //lookup the target role and collect memberlist
            const targetRole = guild.roles.cache.get(r);
            if (targetRole) {
                //add every member to the collection
                targetRole.members.forEach(member => {
                    memberCollection.set(member.id, member)
                });
                // console.log(guild.roles.cache.get(r).members.map(m => m.id))
                // memberCollection.concat(targetRole.members.map(m => m.id));
            }
        }
        //return memberCollection
        return memberCollection;
    }

}