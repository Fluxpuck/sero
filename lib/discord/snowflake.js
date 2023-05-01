/* set default discord EPOCH from discord documentation
https://discord.com/developers/docs/reference#snowflakes */
const DISCORD_EPOCH = 1420070400000;

/**
 * Converts a Discord snowflake ID to a timestamp.
 * @param {string} input - The Discord snowflake ID to convert.
 * @returns {Date|boolean} Returns a Date object representing the timestamp if the input is a valid snowflake ID, or false if the input is invalid.
 */
function convertSnowflake(input) {

    //convert input (string) to Number
    let snowflake = Number(input)

    //if snowflake is not an number, return false
    if (!Number.isInteger(snowflake)) return false
    //if snowflake is too short, return false
    if (snowflake < 4194304) return false

    //convert snowflake to timestamp
    let timestamp = new Date(snowflake / 4194304 + DISCORD_EPOCH)

    //return timestamp
    return timestamp
}

module.exports = { convertSnowflake };