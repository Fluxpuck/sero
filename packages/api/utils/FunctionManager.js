// → Export any Function from this Manager
module.exports = {

    /** 
     * Check is input is Discord Snowflake
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
     * Calculate a random XP value between 15 and 25, adjusted by modifiers
     * @param {number} personalModifier - Personal XP multiplier (default: 1)
     * @param {number} serverModifier - Server XP multiplier (default: 1)
     * @returns {number} - Calculated XP value
     */
    calculateLevelXP(personalModifier = 1, serverModifier = 1) {
        const baseXP = 15;
        const maxXP = 25;

        // 50% chance to get random XP between base and max, otherwise get base XP
        const xp = Math.random() < 0.50 ?
            Math.floor(Math.random() * (maxXP - baseXP + 1) + baseXP) :
            baseXP;

        return xp * serverModifier * personalModifier;
    },

    /**
     * Calculate the XP by randomizing an additional 2,5% to the amount
     * @returns {number} -
     */
    calculateCareerXP(amount = 100) {
        const modifier = Math.random() < 0.50 ? 1 : (1 + (Math.random() * 0.025));
        const randomizedXP = Math.floor(amount * modifier);

        return randomizedXP;
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
     * Generates a new Discord snowflake ID based on the current date.
     * @returns {string} Returns the generated snowflake ID as a string.
     */
    generateSnowflake() {
        const epoch = 1420070400000; // Discord's epoch (Jan 1, 2015)
        const timestamp = BigInt(Date.now() - epoch) << 22n; // Shift timestamp 22 bits to the left
        const workerId = 1n << 17n; // Example worker ID
        const processId = 1n << 12n; // Example process ID
        const increment = 0n; // Example increment (should be unique within a millisecond)

        return (timestamp | workerId | processId | increment).toString();
    }

}