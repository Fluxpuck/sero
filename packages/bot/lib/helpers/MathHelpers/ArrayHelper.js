/**
 * Calcualte the differences between two arrays of objects
 * @param {Array} arr1 Array of objects
 * @param {Array} arr2 Array of objects
 * @returns Object with the differences
 */
function calculateDifferences(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        console.error("Arrays must have the same length");
        return null;
    }

    // Array to store the differences
    const differences = [];

    for (let i = 0; i < arr1.length; i++) {
        const diff = {
            experience: arr1[i].experience - arr2[i].experience,
            level: arr1[i].level - arr2[i].level,
            remainingExp: arr1[i].remainingExp - arr2[i].remainingExp,
        };

        differences.push(diff);
    }

    return differences;
}

/** slice array in chunks
 * @param {Array} array Lenghy array
 * @param {Number} chunk Chunk size
 */
function chunk(array, chunk) {
    let i, j, temp, returnArray = [];
    for (i = 0, j = array.length; i < j; i += chunk) {
        returnArray.push(temp = array.slice(i, i + chunk));
    }
    return returnArray;
}

module.exports = { calculateDifferences, chunk };