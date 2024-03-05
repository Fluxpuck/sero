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

    /**
     * Check if a timestamp is older than 24 hours.
     * @param {timesamp} timestamp - The timestamp to check.
     * @returns - True if the timestamp is older than 24 hours, false otherwise.
     */
    isOlderThan24Hours: (timestamp) => {
        // Parse the timestamp into a JavaScript Date object
        const parsedTimestamp = new Date(timestamp);

        // Get the current time in milliseconds
        const currentTime = Date.now();

        // Calculate the difference in milliseconds between the timestamp and the current time
        const differenceInMilliseconds = currentTime - parsedTimestamp.getTime();

        // Check if the difference is greater than 24 hours (in milliseconds)
        return differenceInMilliseconds > (24 * 60 * 60 * 1000);
    },

    /**
     * Calculate the time left in hours and minutes from a given timestamp after adding 24 hours to it
     * @param {number} timestamp The timestamp in milliseconds
     * @returns {string} A string representing the time left in hours and minutes
     */
    timeLeftToNextDay: (timestamp) => {
        // Convert the timestamp to a Date object and add 24 hours
        const targetDate = new Date(timestamp);
        targetDate.setHours(targetDate.getHours() + 24);

        // Get the current date and time
        const currentDate = new Date();

        // Calculate the difference in milliseconds
        let difference = targetDate - currentDate;

        // Convert milliseconds to hours and minutes
        const hours = Math.floor(difference / (1000 * 60 * 60));
        difference -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(difference / (1000 * 60));

        // Construct the time left string
        let timeLeftString = '';
        if (hours > 0) {
            timeLeftString += `${hours} hour${hours > 1 ? 's' : ''} `;
        }
        timeLeftString += `${minutes} minute${minutes > 1 ? 's' : ''}`;

        // Return the time left as a string
        return timeLeftString;
    }


};