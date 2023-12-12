/**
 * A collection of string helper functions.
 * @module stringHelper
 */

module.exports = {
	/**
	 * Normalizes the text by adding a space between lowercase and uppercase letters.
	 * @param {string} text - The input text to be normalized.
	 * @returns {string} - The normalized text.
	 */
	normalizeText: (text) => {
		return text.replace(/([a-z])([A-Z])/g, '$1 $2');
	},

	/**
	 * Capitalizes the first letter of each word in a string.
	 * @param {string} str - The input string to be capitalized.
	 * @returns {string} - The capitalized string.
	 */
	capitalize: (str) => {
		return str.replace(/\w\S*/g, function (txt) {
			if (txt.charAt(0) == "'") {
				return;
			} else {
				return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
			}
		});
	},

	/**
	 * Escapes special characters in a regular expression pattern.
	 * @param {string} str - The input string to be escaped.
	 * @returns {string} - The escaped string.
	 */
	regEscape: (str) => {
		return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	},
};