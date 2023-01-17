/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    The CacheManager contains all functions to  */

//load npm modules
const NodeCache = require("node-cache");

//load functions from Managers
const { getCustomCommandsDB, getGuildPrefix, getGuildApplyId, checkTableExistance } = require("../database/QueryManager");
const { defaultPrefix } = require('../config/config.json');
const { InteractionCollector } = require("discord.js");

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

    /** load apply channeld id from database to guild collection
     * @param {*} guild 
     */
    async loadGuildApplyChannel(guild) {
        var apply_channeldId = await getGuildApplyId(guild.id); //get apply channel id from database
        guild.applyId = apply_channeldId; //set custom values and save in guild
    },

    /** load guild features and store to guild collection
     * @param {*} guild 
     */
    async loadGuildFeatures(guild) {
        //collect application features by checking if tables exists
        const customcommandsTable = await checkTableExistance(`${guild.id}_commands`);
        const economyTable = await checkTableExistance(`${guild.id}_economycredits`);
        const applicationTable = await checkTableExistance(`${guild.id}_applications`);

        //setup the guild featurelist
        const guildFeatures = []

        //push features to Array
        if (customcommandsTable.length >= 1) guildFeatures.push(`CUSTOMCOMMANDS`)
        if (economyTable.length >= 1) guildFeatures.push(`ECONOMY`)
        if (applicationTable.length >= 1) guildFeatures.push(`APPLICATION`)

        //add all guild features to guild collection
        guild.fluxFeatures = guildFeatures;

    }






}