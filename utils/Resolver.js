/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    The Resolver contains all functions parsing and collecting information */

//require packages & functions
const mysql = require('mysql');
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