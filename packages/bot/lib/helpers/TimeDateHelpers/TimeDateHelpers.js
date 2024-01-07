module.exports = {

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
    },

    /**
     * Get the duration in minutes between a timestamp and the current time.
     * @param {timestamp} timestamp - The timestamp to calculate the duration of. 
     * @returns {number} - The duration in minutes, rounded up.
     */
    calculateRoundedDuration: (timestamp) => {
        const newTimestamp = new Date(timestamp).getTime();
        const now = Date.now(); // Current time in milliseconds

        const differenceInMillis = Math.abs(now - newTimestamp); // Absolute difference
        const differenceInMinutes = Math.ceil(differenceInMillis / (1000 * 60));

        return differenceInMinutes;
    }
};