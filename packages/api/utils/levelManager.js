module.exports = {

    // → Function to calculate the level from the experience
    calculateLevel(experience) {
        const BASE_EXP = 80;
        const EXP_MULTIPLIER = 1.35;

        // Calculate the level using the provided formula
        const level = (experience < BASE_EXP) ? 1 : Math.floor(Math.log(experience / BASE_EXP) / Math.log(EXP_MULTIPLIER)) + 1;

        // Calculate the experience required for the next level
        let nextLevelExp = Math.ceil(BASE_EXP * Math.pow(EXP_MULTIPLIER, level));
        nextLevelExp = nextLevelExp < BASE_EXP ? BASE_EXP : nextLevelExp;

        // Calculate the total experience needed to reach the next level
        const remainingExp = nextLevelExp - experience;

        return { level, nextLevelExp, remainingExp };
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