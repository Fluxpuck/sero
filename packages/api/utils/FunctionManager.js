const { createError } = require('../utils/ClassManager');

// → Export any Function from this Manager
module.exports = {

    /** Check is input is Discord Snowflake
     * @param {*} input - input to check
     * @returns - true if input is a snowflake, else false
     */
    checkSnowflake(input) {
        /* set default discord EPOCH from discord documentation
        https://discord.com/developers/docs/reference#snowflakes */
        const DISCORD_EPOCH = 1420070400000

        //convert input (string) to Number
        let snowflake = Number(input);

        //if snowflake is not an number, return false
        if (!Number.isInteger(snowflake)) return false
        //if snowflake is too short, return false
        if (snowflake < 4194304) return false

        //convert snowflake to timestamp
        let timestamp = new Date(snowflake / 4194304 + DISCORD_EPOCH)

        //check if value is a date & return
        if (timestamp instanceof Date && !isNaN(timestamp)) return true
        else return false
    },

    /**
     * Generate a unique token
     * @returns - unique token
     */
    generateUniqueToken() {
        const tokenLength = 5;
        const min = Math.pow(10, tokenLength - 1);
        const max = Math.pow(10, tokenLength) - 1;

        const timestamp = Date.now().toString();
        const tokenSuffix = Math.floor(Math.random() * (max - min + 1)) + min;

        const uniqueToken = timestamp + tokenSuffix.toString();
        return uniqueToken;
    },

    /**
     * Generate a unique hash code
     * @param {*} userId 
     * @param {*} guildId 
     * @returns 
     */
    generateUniqueHash(userId, guildId) {
        const combinedString = userId + guildId;
        let hash = 0;
        for (let i = 0; i < combinedString.length; i++) {
            const char = combinedString.charCodeAt(i);
            hash = (hash << 5) - hash + char;
        }
        return Math.abs(hash); // Ensure the result is always positive
    },

    /**
     * Validate params
     * @param {*} req - request
     * @param {*} paramNames - array of param names
     * @returns - error if invalid, else returns requested params
     */
    validateParams(req, paramNames) {
        for (const paramName of paramNames) {
            const paramValue = req.params[paramName];
            //check correct if param is provided
            if (!paramValue) {
                return new createError(400, `No ${paramName} provided.`);
            }
            //check if param is a snowflake
            if (!module.exports.checkSnowflake(paramValue)) {
                return new createError(404, `The provided ${paramName} is invalid. Please ensure that it is a valid Discord Snowflake.`);
            }
        }
    },

    /**
     * Validate data
     * @param {*} req - request
     * @param {*} dataNames - array of data names
     * @returns - error if invalid, else returns requested data
     */
    validateData(req, dataNames) {
        for (const dataName of dataNames) {
            const dataValue = req.body[dataName];
            //check correct if data is provided
            if (!dataValue) {
                return new createError(400, `No ${dataName} provided.`);
            }

            switch (dataName) {
                case 'guild':
                    if (!req.body[dataName].guildId) return new createError(400, `No ${dataName}.guildId provided.`);
                    if (!req.body[dataName].guildName) return new createError(400, `No ${dataName}.guildName provided.`);
                    break;
                case 'user':
                    if (!req.body[dataName].userId) return new createError(400, `No ${dataName}.userId provided.`);
                    if (!req.body[dataName].userName) return new createError(400, `No ${dataName}.userName provided.`);
                    if (!req.body[dataName].guildId) return new createError(400, `No ${dataName}.guildId provided.`);
                    break;
                case 'level':
                    if (!req.body[dataName].experience) return new createError(400, `No ${dataName}.experience provided.`);
                    if (!req.body[dataName].userId) return new createError(400, `No ${dataName}.userId provided.`);
                    break;
                case 'moderator':
                    if (!req.body[dataName].location) return new createError(400, `No ${dataName}.location provided.`);
                    if (!req.body[dataName].language) return new createError(400, `No ${dataName}.language provided.`);
                    if (!req.body[dataName].rank) return new createError(400, `No ${dataName}.rank provided.`);
                    if (!req.body[dataName].userId) return new createError(400, `No ${dataName}.userId provided.`);
                    if (!req.body[dataName].guildId) return new createError(400, `No ${dataName}.guildId provided.`);
                    break;
                case 'message':
                    if (!req.body[dataName].messageId) return new createError(400, `No ${dataName}.messageId provided.`);
                    if (!req.body[dataName].channelId) return new createError(400, `No ${dataName}.channelId provided.`);
                    if (!req.body[dataName].userId) return new createError(400, `No ${dataName}.userId provided.`);
                    if (!req.body[dataName].guildId) return new createError(400, `No ${dataName}.guildId provided.`);
                    break;
                case 'event':
                    if (!req.body[dataName].category) return new createError(400, `No ${dataName}.category provided.`);
                    if (!req.body[dataName].channelId) return new createError(400, `No ${dataName}.channelId provided.`);
                    if (!req.body[dataName].guildId) return new createError(400, `No ${dataName}.guildId provided.`);
                    break;
                case 'command':
                    if (!req.body[dataName].commandId) return new createError(400, `No ${dataName}.commandId provided.`);
                    if (!req.body[dataName].commandName) return new createError(400, `No ${dataName}.commandName provided.`);
                    if (!req.body[dataName].clientId) return new createError(400, `No ${dataName}.clientId provided.`);
                    break;
                default:
                    break;
            }
            //return requested body
            return req.body;
        }
    }
}