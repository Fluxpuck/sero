module.exports = {

    // → Function to calculate the level from the experience
    calculateLevel(experience) {
        const baseExp = 80; //amount of experience points required to reach level 1
        const expMultiplier = 1.05; //factor by which the amount of experience points required to level up increases

        const level = Math.floor(Math.log((experience / baseExp) * (expMultiplier - 1) + 1) / Math.log(expMultiplier)) + 1; //calculate current level
        const currentLevelExp = Math.floor(baseExp * (Math.pow(expMultiplier, level - 1) - 1) / (expMultiplier - 1)); //calculate experience points required to reach current level
        const nextLevelExp = Math.floor(baseExp * (Math.pow(expMultiplier, level) - 1) / (expMultiplier - 1)); //calculate experience points required to reach next level
        const remainingExp = nextLevelExp - experience; //calculate remaining experience points needed to level up

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