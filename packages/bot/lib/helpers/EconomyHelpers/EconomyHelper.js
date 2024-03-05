module.exports = {

    /**
     * Calculate the daily income of a user
     * @param {Number} wage 
     * @param {Percentage} raise 
     * @param {Integer} level 
     * @returns - The daily income of the user
     */
    calculateDailyIncome: (wage, raise, level) => {
        const WORK_DAYS_VALUE = 365;
        return (wage / WORK_DAYS_VALUE) * (level * raise);
    },

    /**
     * Calculate the base income of a user
     * @param {Number} wage 
     * @returns - The base income of the user
     */
    calculateBaseIncome: (wage) => {
        const WORK_DAYS_VALUE = 365;
        return wage / WORK_DAYS_VALUE;
    }

}