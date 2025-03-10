const WORK_DAYS_VALUE = 340;

module.exports = {
    /**
     * Calculate the daily income of a user
     * @param {Number} salary 
     * @param {Percentage} raise 
     * @param {Integer} level 
     * @returns - The daily income of the user
     */
    calculateDailyIncome: (salary, raise, level) => {

        // Calculate the base income of the user
        const baseIncome = module.exports.calculateBaseIncome(salary);

        // Calculate the pay raise of the user
        const onePercentage = baseIncome / 100;
        const payRaise = level > 1 ? (onePercentage * raise) * level : 0;

        // Calculate the total income of the user
        const income = baseIncome + payRaise;

        return Math.round(income);
    },

    /**
     * Calculate the base income of a user
     * @param {Number} salary 
     * @returns - The base income of the user
     */
    calculateBaseIncome: (salary) => {
        return Math.round(salary / WORK_DAYS_VALUE);
    },

    /**
     * Get the reward based on the streak
     * @param {*} streak 
     * @returns - The reward amount
     */
    getReward: (streak) => {
        const rewards = [
            { days: 5, reward: 1000 },
            { days: 15, reward: 1500 },
            { days: 30, reward: 2000 },
            { days: 50, reward: 2500 },
            { days: 75, reward: 3500 },
            { days: 100, reward: 5000 },
            { days: 130, reward: 6500 },
            { days: 150, reward: 8000 },
            { days: 180, reward: 10000 },
            { days: 210, reward: 12500 },
            { days: 250, reward: 15000 },
            { days: 300, reward: 20000 },
            { days: 365, reward: 25000 }
        ];

        for (const tier of rewards) {
            if (streak <= tier.days) {
                return tier.reward;
            }
        }

        return 2000;
    }

}