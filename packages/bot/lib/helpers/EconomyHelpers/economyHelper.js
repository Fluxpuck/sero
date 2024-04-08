const WORK_DAYS_VALUE = 365;

module.exports = {
    /**
     * Calculate the daily income of a user
     * @param {Number} wage 
     * @param {Percentage} raise 
     * @param {Integer} level 
     * @returns - The daily income of the user
     */
    calculateDailyIncome: (wage, raise, level) => {

        // Calculate the base income of the user
        const baseIncome = module.exports.calculateBaseIncome(wage);

        // Calculate the pay raise of the user
        const onePercentage = baseIncome / 100;
        const payRaise = level > 1 ? (onePercentage * raise) * level : 0;

        // Calculate the total income of the user
        const income = baseIncome + payRaise;

        return Math.round(income);
    },

    /**
     * Calculate the base income of a user
     * @param {Number} wage 
     * @returns - The base income of the user
     */
    calculateBaseIncome: (wage) => {
        return Math.round(wage / WORK_DAYS_VALUE);
    }

}