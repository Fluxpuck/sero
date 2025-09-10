/**
 * Calculate the differences between two arrays of objects
 * @param {Array} arr1 Array of objects
 * @param {Array} arr2 Array of objects
 * @returns Array of objects with the differences
 */
function calculateDifferences(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        console.error("Arrays must have the same length");
        return null;
    }

    // Array to store the differences
    const differences = [];

    for (let i = 0; i < arr1.length; i++) {
        const obj1 = arr1[i];
        const obj2 = arr2[i];

        // Get unique keys from both objects
        const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        const diff = {};

        keys.forEach(key => {
            const value1 = obj1[key] || 0;
            const value2 = obj2[key] || 0;
            diff[key] = value1 - value2;
        });

        differences.push(diff);
    }

    return differences;
}


/**
 * Get a random object in an array
 * @param {Array} array
 */
function randomInArray(array) {
    return array[Math.floor(Math.random() * array.length)];
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

module.exports = { calculateDifferences, chunk, randomInArray };
