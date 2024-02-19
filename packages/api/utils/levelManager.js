module.exports = {

    // → Function to calculate the level from the experience
    calculateLevel(experience) {
        const BASE_EXP = 100;
        const EXP_MULTIPLIER = 1.35;

        // Calculate the level using the provided formula
        const level = Math.floor(Math.log(experience / BASE_EXP) / Math.log(EXP_MULTIPLIER));

        // Calculate the experience required for the next level
        const nextLevelExp = Math.ceil(BASE_EXP * Math.pow(EXP_MULTIPLIER, level + 1));

        // Calculate the total experience needed to reach the next level
        const experienceToNextLevel = nextLevelExp - experience;

        console.log(`Level: ${level}`);
        console.log(`Experience: ${experience}`)
        console.log(`Next Level Exp: ${nextLevelExp}`);
        console.log(`Experience to Next Level: ${experienceToNextLevel}`);

        return { level, nextLevelExp, experienceToNextLevel };
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