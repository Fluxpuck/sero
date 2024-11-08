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
    },

    /**
     * Get the reward based on the streak
     * @param {*} streak 
     * @returns - The reward amount
     */
    getReward: (streak) => {
        const rewards = [
            { days: 5, reward: 100 },
            { days: 15, reward: 150 },
            { days: 30, reward: 200 },
            { days: 50, reward: 250 },
            { days: 75, reward: 350 },
            { days: 100, reward: 500 },
            { days: 130, reward: 650 },
            { days: 150, reward: 800 },
            { days: 180, reward: 1000 },
            { days: 210, reward: 1250 },
            { days: 250, reward: 1500 },
            { days: 300, reward: 2000 },
            { days: 365, reward: 2500 }
        ];

        for (const tier of rewards) {
            if (streak <= tier.days) {
                return tier.reward;
            }
        }

        return 2000;
    }

}