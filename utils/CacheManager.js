/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    The CacheManager contains all functions to  */

//load npm modules
const NodeCache = require("node-cache");

//load functions from Managers
const { getCustomCommands } = require("../database/QueryManager");

//build cache
const guildCommandCache = new NodeCache();

module.exports = {

    /** load commands from database to cache
     * @param {*} guild 
     */
    async loadCommandCache(guild) {
        const commands = await getCustomCommands(guild);
        await guildCommandCache.set(guild.id, commands)
    },

    /** get specific command from command cache
     * @param {*} guild 
     * @param {*} inputCommand 
     * @returns 
     */
    async getCommandFromCache(guild, inputCommand) {
        const commandCache = guildCommandCache.get(guild.id);
        const commandDetails = commandCache.filter(c => c.commandName === inputCommand);
        return commandDetails[0]
    }








}