module.exports = {

    /**
    * Format a time duration in milliseconds as a string in the format "<day(s)>d <hr>h <min>m <s>s".
    * @param {number} timeInMilliseconds - The time duration in milliseconds.
    * @returns {string} The formatted time string.
    */
    formatTime: (timeInMilliseconds) => {
        // Calculate the number of days, hours, minutes, and seconds
        const days = Math.floor(timeInMilliseconds / 86400000);
        const hours = Math.floor(timeInMilliseconds / 3600000) % 24;
        const minutes = Math.floor(timeInMilliseconds / 60000) % 60;
        const seconds = Math.floor(timeInMilliseconds / 1000) % 60;

        // Create a display string for each unit of time
        const dDisplay = days > 0 ? `${days}d ` : '';
        const hDisplay = hours > 0 ? `${hours}h ` : '';
        const mDisplay = minutes > 0 ? `${minutes}m ` : '';
        const sDisplay = seconds > 0 ? `${seconds}s` : '';

        // Return the combined display string
        return `${dDisplay}${hDisplay}${mDisplay}${sDisplay}`;
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
    },
};