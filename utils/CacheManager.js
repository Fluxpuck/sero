/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    The CacheManager contains all functions to  */

//load npm modules
const NodeCache = require("node-cache");

//load functions from Managers
const { getCustomCommandsDB, getGuildPrefix } = require("../database/QueryManager");
const { defaultPrefix } = require('../config/config.json');

//build cache
const guildCommandCache = new NodeCache();

module.exports = {

    /** load custom commands from database to cache
     * @param {*} guild 
     */
    async loadCustomCommands(guild) {
        const commands = await getCustomCommandsDB(guild);
        await guildCommandCache.set(guild.id, commands)
    },

    /** get all custom commands from cache
     * @param {*} guild 
     */
    async getCustomCommands(guild) {
        return guildCommandCache.get(guild.id);
    },

    /** get specific custom command from cache
     * @param {*} guild 
     * @param {*} inputCommand 
     * @returns 
     */
    async getCustomCommandFromCache(guild, inputCommand) {
        const commandCache = guildCommandCache.get(guild.id);
        const commandDetails = commandCache.filter(c => c.commandName === inputCommand.substring(1)); //remove prefix from custom command
        return commandDetails[0]
    },

    /** load prefix from database to guild collection
     * @param {Object} guild
     */
    async loadGuildPrefixes(guild) {
        var prefix = await getGuildPrefix(guild.id); //get prefix from database
        if (prefix == undefined || prefix == null || prefix == false) prefix = defaultPrefix; //set prefix value
        guild.prefix = prefix; //set custom values and save in guild
    },








}