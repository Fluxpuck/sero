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
     * Calculate a random XP value for a member between 15 and 25
     * And multiply with the personal and server modifier
     * @param {*} personalModifier 
     * @param {*} serverModifier 
     * @returns 
     */
    calculateXP(personalModifier = 1, serverModifier = 1) {
        let baseXP = 15;
        let maxXP = 25;

        //generate a random number between 0 and 1
        let randNum = Math.random();
        let randomizedXP;

        if (randNum <= 0.5) {
            //the member gets a randomized XP value between baseXP and maxXP
            randomizedXP = Math.floor(Math.random() * (maxXP - baseXP + 1) + baseXP) * personalModifier * serverModifier;
        } else {
            //the member gets the base XP value
            randomizedXP = baseXP * personalModifier * serverModifier;
        }

        return randomizedXP;
    }

}