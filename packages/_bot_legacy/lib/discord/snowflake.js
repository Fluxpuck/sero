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

/**
 * Generates a new Discord snowflake ID based on the current date.
 * @returns {string} Returns the generated snowflake ID as a string.
 */
function generateSnowflake() {
    const epoch = 1420070400000; // Discord's epoch (Jan 1, 2015)
    const timestamp = BigInt(Date.now() - epoch) << 22n; // Shift timestamp 22 bits to the left
    const workerId = 1n << 17n; // Example worker ID
    const processId = 1n << 12n; // Example process ID
    const increment = 0n; // Example increment (should be unique within a millisecond)

    return (timestamp | workerId | processId | increment).toString();
}

module.exports = {
    convertSnowflake,
    generateSnowflake
};