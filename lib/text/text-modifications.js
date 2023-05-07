/**
 * This function takes a string argument 'str',
 * and returns a new string with the first letter capitalized and the rest of the letters in lowercase.
 * @param {String} str - The string to be capitalized.
 * @returns Returns a new string with the first letter capitalized and the rest of the letters in lowercase.
 */
function capitalize(str) {
    // The 'replace' method of the string object takes a regular expression and a function as arguments.
    return str.replace(
        // The regular expression /\w\S*/g matches any word character followed by zero or more non-whitespace characters.
        // The 'g' flag makes the regular expression global, meaning it will match all occurrences in the string.
        /\w\S*/g,
        // The second argument is a function that will be called for each match found by the regular expression.
        function (txt) {
            // This conditional checks if the first character of the matched string is an apostrophe. If it is, the function returns undefined, effectively removing that word from the string.
            if (txt.charAt(0) == "'") {
                return
            } else {
                // If the first character is not an apostrophe, the function returns the capitalized word using the 'toUpperCase' and 'toLowerCase' methods of the string object.
                return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
            }
        }
    );
}

module.exports = { capitalize };