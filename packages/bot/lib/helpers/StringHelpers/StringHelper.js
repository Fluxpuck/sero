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

	/**
	 * Format a time duration in seconds as a string in the format "hh:mm:ss".
	 * @param {number} timeInSeconds - The time duration in seconds.
	 * @returns {string} The formatted time string.
	 */
	formatTime: (timeInSeconds) => {
		// Define a helper function to pad numbers with leading zeros
		const pad = (num) => String(num).padStart(2, '0');
		// Calculate the number of hours in the time and round down to the nearest integer
		const hours = Math.floor(timeInSeconds / 3600);
		// Calculate the number of minutes in the time and round down to the nearest integer
		const minutes = Math.floor((timeInSeconds % 3600) / 60);
		// Calculate the number of seconds in the time and round down to the nearest integer
		const seconds = Math.floor(timeInSeconds % 60);
		// Return a string that represents the time in the format of "HH:MM:SS"
		return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
	}

};