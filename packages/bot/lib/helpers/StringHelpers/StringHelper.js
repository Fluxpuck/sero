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
	 * Formats a string to be used as a regular expression pattern.
	 * @param {string} str - The input string to be formatted.
	 * @returns {string} - The formatted string.
	 */
	formatExpression: (str) => {
		const words = str.split('_');
		const formattedString = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
		return formattedString;
	},

	/**
	 * Formats a number where 3 digits are as it is, and the rest is then made as K, M, B, etc. (e.g. 1,000,000 becomes 1M)
	 * @param {number} exp - The number to be formatted.
	 * @returns {string} - The formatted number.
	 * @example formatExp(1000) // 1K
	 * @example formatExp(10000) // 10K
	 * @example formatExp(100000) // 100K
	 * @example formatExp(1000000) // 1M
	 * @example formatExp(10000000) // 10M
	 * @example formatExp(100000000) // 100M
	 */
	formatNumberWithSuffix: (num) => {

		if (isNaN(num)) return num;

		if (num < 1000) {
			return num.toString();
		} else if (num < 1000000) {
			const result = Math.round((num / 1000) * 10) / 10;
			return result % 1 === 0 ? result.toFixed(0) + "K" : result + "K";
		} else if (num < 1000000000) {
			const result = Math.round((num / 1000000) * 10) / 10;
			return result % 1 === 0 ? result.toFixed(0) + "M" : result + "M";
		} else if (num < 1000000000000) {
			const result = Math.round((num / 1000000000) * 10) / 10;
			return result % 1 === 0 ? result.toFixed(0) + "B" : result + "B";
		}
	},
};