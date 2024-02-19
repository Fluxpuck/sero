module.exports = {

    // → Function to calculate the level from the experience
    calculateLevel(experience) {
        const BASE_EXP = 100; // Amount of experience points required to reach level 1
        const EXP_MULTIPLIER = 1.37; // Factor by which the amount of experience points required to level up increases
        const DECREASE_FACTOR = 0.13; // Factor by which the exp multiplier decreases every level
        const DECREASE_INTERVAL = 3; // Decrease the multiplier every 3 levels
        const MIN_MULTIPLIER = 0.67; // Minimum adjustedMultiplier value

        // Calculate the adjusted multiplier for the given experience points
        let adjustedMultiplier = EXP_MULTIPLIER;
        if (experience > BASE_EXP) {
            const level = Math.floor(Math.log(experience / BASE_EXP) / Math.log(EXP_MULTIPLIER)) + 1;
            if (level % DECREASE_INTERVAL === 0) {
                adjustedMultiplier -= DECREASE_FACTOR;
            }
        }

        // Ensure the adjustedMultiplier doesn't go below the minimum value
        adjustedMultiplier = Math.max(adjustedMultiplier, MIN_MULTIPLIER);

        // Calculate the level using the logarithmic scale
        const level = Math.max(0, Math.floor(Math.log(experience / BASE_EXP) / Math.log(adjustedMultiplier)) + 1);

        // Calculate current level's experience
        const currentLevelExp = Math.floor(BASE_EXP * Math.pow(adjustedMultiplier, level));

        // Calculate next level's experience
        const nextLevelExp = Math.floor(BASE_EXP * Math.pow(adjustedMultiplier, level + 1));

        // Calculate remaining experience to reach the next level
        const remainingExp = nextLevelExp - experience;

        return { level, currentLevelExp, nextLevelExp, remainingExp };
    },



    // → Function to calculate XP
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