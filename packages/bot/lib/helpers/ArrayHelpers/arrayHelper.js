module.exports = {

    /**
     * Count the unique user ids from an array
     * @param {*} array 
     * @returns 
     */
    async countUniqueUserIds(array = []) {
        if (!Array.isArray(array)) {
            return [];
        }
        return Array.from(
            array.reduce((acc, claim) => {
                const id = claim.userId; // Extract userId from claim
                acc.set(id, (acc.get(id) || 0) + 1); // Count occurrences
                return acc;
            }, new Map())
        ).map(([userId, claimed]) => ({ userId, claimed }));
    },

}