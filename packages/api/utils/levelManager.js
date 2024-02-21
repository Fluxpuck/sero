module.exports = {

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